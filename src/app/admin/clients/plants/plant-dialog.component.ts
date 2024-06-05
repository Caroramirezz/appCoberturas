import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PlantsInterface } from '../interfaces/plants.interface';
import { PlantsService } from '../services/plants.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-plant-dialog',
  templateUrl: './plant-dialog.component.html',
  styleUrls: ['./plant-dialog.component.scss']
})
export class PlantDialogComponent implements OnInit {

  plants: PlantsInterface[] = [];
  selectedClient: any;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private plantsService: PlantsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.selectedClient = this.config.data.client;
    this.plants = this.config.data.plants;
    console.log('Dialog opened with plants:', this.plants); // Add logging
  }

  onRowEditInit(plant: PlantsInterface): void {
    console.log('Row edit initialized', plant);
  }

  onRowEditSave(plant: PlantsInterface): void {
    if (plant.id_plant === 0) {
      this.plantsService.addPlant(plant).subscribe({
        next: (newPlant) => {
          this.toastr.success('Plant added successfully');
          Object.assign(plant, newPlant); // Update the local plant object with the new ID from the server
        },
        error: (error) => {
          this.toastr.error('Error adding plant');
          console.error('Error adding plant', error);
        }
      });
    } else {
      this.plantsService.updatePlant(plant).subscribe({
        next: () => {
          this.toastr.success('Plant updated successfully');
        },
        error: (error) => {
          this.toastr.error('Error updating plant');
          console.error('Error updating plant', error);
        }
      });
    }
  }

  onRowEditCancel(plant: PlantsInterface, index: number): void {
    console.log('Row edit cancelled', plant, index);
    if (plant.id_plant === 0) {
      this.plants.splice(index, 1); // Remove the new plant if cancelled
    }
  }

  addPlant(): void {
    const newPlant: PlantsInterface = { id_plant: 0, name_plant: '', inicio_contrato: new Date(), fin_contrato: new Date(), id_client: this.selectedClient.id_client };
    this.plants = [...this.plants, newPlant];
  }

  deletePlant(plant: PlantsInterface): void {
    if (plant.id_plant === 0) {
      // If the plant is newly added and not yet saved to the server
      this.plants = this.plants.filter(p => p !== plant);
    } else {
      this.plantsService.deletePlant(plant.id_plant).subscribe({
        next: () => {
          this.toastr.success('Plant deleted successfully');
          this.loadPlants(); // Reload plants to reflect changes
        },
        error: (error) => {
          this.toastr.error('Error deleting plant');
          console.error('Failed to delete plant', error);
        }
      });
    }
  }

  loadPlants(): void {
    if (this.selectedClient) {
      this.plantsService.getPlantsByClientId(this.selectedClient.id_client).subscribe({
        next: (plants) => {
          this.plants = plants;
        },
        error: (err) => {
          console.error('Failed to load plants', err);
          this.toastr.error('Failed to load plants for the selected client');
        }
      });
    }
  }
}
