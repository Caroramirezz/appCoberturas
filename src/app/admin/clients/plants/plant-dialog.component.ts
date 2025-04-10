import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ClientInterface } from '../interfaces/clients.interface';
import { PlantsInterface } from '../interfaces/plants.interface';
import { ClientsService } from '../services/clients.service';
import { PlantsService } from '../services/plants.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-plant-dialog',
  templateUrl: './plant-dialog.component.html',
  styleUrls: ['./plant-dialog.component.scss'],
})
export class PlantDialogComponent implements OnInit {

  client: ClientInterface;
  originalClient: ClientInterface; // Store the original client data
  plants: PlantsInterface[] = [];
  originalPlants: { [id: number]: PlantsInterface } = {}; // Store original plant data
  editingClient: boolean = false;
  unitOptions: { label: string, value: string }[] = [
    { label: 'Gigajoules', value: 'Gigajoules' },
    { label: 'MMBtu', value: 'MMBtu' }
  ];
  formClient: FormGroup;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private clientsService: ClientsService,
    private plantsService: PlantsService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.client = this.config.data.client;
    this.originalClient = { ...this.client }; // Make a copy of the original client data
    this.plants = this.config.data.plants;
    this.formClient = this.fb.group({
      client_id: [this.client.id_client, Validators.required],
      client_name: [this.client.client, Validators.required],
      holding: [this.client.holding, Validators.required]
    });

    // Store original plant data
    this.plants.forEach(plant => {
      if (plant.id_plant !== undefined) {
        this.originalPlants[plant.id_plant] = { ...plant };
      }
    });
  }

  ngOnInit(): void {}

  editClient(): void {
    this.editingClient = true;
  }

  saveClient(): void {
    if (this.formClient.invalid) {
      this.toastr.error('Please fill all required fields');
      this.editingClient = true; // Remain in editing mode
      return;
    }

    this.clientsService.updateClient(this.client).subscribe({
      next: () => {
        this.toastr.success('Client updated successfully');
        this.editingClient = false;
        this.originalClient = { ...this.client }; // Update the original values after save
      },
      error: (error) => {
        this.editingClient = true; // Remain in editing mode
        if (error.status === 404) {
          this.toastr.error('Client not found');
        } else {
          this.toastr.error('Error updating client');
        }
        console.error('Error updating client', error);
      }
    });
  }

  cancelEditClient(): void {
    this.editingClient = false;
    this.client = { ...this.originalClient }; // Revert to original client values
  }

  onRowEditInit(plant: PlantsInterface): void {
    plant.editing = true;
    if (plant.id_plant !== undefined) {
      this.originalPlants[plant.id_plant] = { ...plant };
    }
  }

  onRowEditSave(plant: PlantsInterface): void {
    if (!plant.name_plant || !plant.inicio_contrato || !plant.fin_contrato || !plant.cmd || !plant.unidad) {
      this.toastr.error('Please fill all required fields');
      plant.editing = true;
      return;
    }
  
    if (!plant.id_client) {
      this.toastr.error('No client associated with this plant');
      return;
    }
  
  
    if (plant.id_plant === 0) {
      this.plantsService.addPlant(plant).subscribe({
        next: (response) => {
          this.toastr.success('Plant added successfully');
          plant.id_plant = response.id;
          plant.editing = false;
          this.originalPlants[plant.id_plant] = { ...plant };
        },
        error: (error) => {
          this.toastr.error('Error adding plant');
          console.error('Error adding plant', error);
          setTimeout(() => { plant.editing = true; }, 0);
        }
      });
    } else {
      this.plantsService.updatePlant(plant).subscribe({
        next: () => {
          this.toastr.success('Plant updated successfully');
          plant.editing = false;
          this.originalPlants[plant.id_plant] = { ...plant };
        },
        error: (error) => {
          this.toastr.error('Error updating plant');
          console.error('Error updating plant', error);
          setTimeout(() => { plant.editing = true; }, 0);
        }
      });
    }
  }
  

  onRowEditCancel(plant: PlantsInterface): void {
    plant.editing = false;
    if (plant.id_plant !== undefined) {
      const originalPlant = this.originalPlants[plant.id_plant];
      if (originalPlant) {
        Object.assign(plant, originalPlant);
      }
    }
  }

  addPlant(): void {
    if (!this.client) {
      this.toastr.error('No client selected');
      return;
    }
  
    const newPlant: PlantsInterface = {
      id_plant: 0,
      name_plant: '',
      inicio_contrato: new Date(),
      fin_contrato: new Date(),
      cmd: 0,
      unidad: '',
      id_client: this.client.id_client
    };
  
    this.plants = [newPlant, ...this.plants];
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

  closeDialog(): void {
    if (!this.editingClient) {
      this.client = { ...this.originalClient }; // Revert to original client values if not saved
    }
    this.ref.close();
  }

  // Custom validation for date logic
  isInvalidDateRange(plant: PlantsInterface): boolean {
    return new Date(plant.inicio_contrato) > new Date(plant.fin_contrato);
  }
}
