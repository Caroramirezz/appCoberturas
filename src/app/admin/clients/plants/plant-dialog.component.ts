import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ClientInterface } from '../interfaces/clients.interface';
import { PlantsInterface } from '../interfaces/plants.interface';
import { ClientsService } from '../services/clients.service';
import { PlantsService } from '../services/plants.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-plant-dialog',
  templateUrl: './plant-dialog.component.html',
  styleUrls: ['./plant-dialog.component.scss']
})
export class PlantDialogComponent implements OnInit {

  client: ClientInterface;
  plants: PlantsInterface[] = [];
  editingClient: boolean = false;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private clientsService: ClientsService,
    private plantsService: PlantsService,
    private toastr: ToastrService
  ) {
    this.client = this.config.data.client;
    this.plants = this.config.data.plants;
  }

  ngOnInit(): void {
  }

  editClient(): void {
    this.editingClient = true;
  }

  saveClient(): void {
    this.clientsService.updateClient(this.client).subscribe({
      next: () => {
        this.toastr.success('Client updated successfully');
        this.editingClient = false;
      },
      error: (error) => {
        this.toastr.error('Error updating client');
        console.error('Error updating client', error);
      }
    });
  }

  cancelEditClient(): void {
    this.editingClient = false;
    this.client = { ...this.config.data.client }; // Reset client data to original
  }

  onRowEditInit(item: any): void {
  }

  onRowEditSave(item: any): void {
    if (item.id_plant) {
      // If editing plant
      this.plantsService.updatePlant(item).subscribe({
        next: () => {
          this.toastr.success('Plant updated successfully');
        },
        error: (error) => {
          this.toastr.error('Error updating plant');
          console.error('Error updating plant', error);
        }
      });
    } else {
      // If editing client
      this.saveClient();
    }
  }

  onRowEditCancel(item: any): void {
    console.log('Row edit cancelled', item);
    if (item.id_plant === 0) {
      this.plants = this.plants.filter(p => p !== item);
    } else {
      // Handle the cancellation of plant edit
      const originalPlant = this.plants.find(p => p.id_plant === item.id_plant);
      if (originalPlant) {
        item.name_plant = originalPlant.name_plant;
        item.inicio_contrato = originalPlant.inicio_contrato;
        item.fin_contrato = originalPlant.fin_contrato;
      }
    }
  }

  addPlant(): void {
    const newPlant: PlantsInterface = { id_plant: 0, name_plant: '', inicio_contrato: new Date(), fin_contrato: new Date() };
    this.plants = [newPlant, ...this.plants]; // Add the new plant to top
  }

  deletePlant(plant: PlantsInterface): void {
    if (plant.id_plant === 0) {
      this.plants = this.plants.filter(p => p !== plant);
    } else {
      this.plantsService.deletePlant(plant.id_plant).subscribe({
        next: () => {
          this.toastr.success('Plant deleted successfully');
          this.plants = this.plants.filter(p => p.id_plant !== plant.id_plant);
        },
        error: (error) => {
          this.toastr.error('Error deleting plant');
          console.error('Failed to delete plant', error);
        }
      });
    }
  }
}
