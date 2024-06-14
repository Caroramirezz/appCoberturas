import { Component, OnInit } from '@angular/core';
import { ClientInterface } from '../interfaces/clients.interface';
import { PlantsInterface } from '../interfaces/plants.interface';
import { ClientsService } from '../services/clients.service';
import { PlantsService } from '../services/plants.service';
import { ToastrService } from 'ngx-toastr';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PlantDialogComponent } from '../plants/plant-dialog.component';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  providers: [DialogService]
})
export class ClientsComponent implements OnInit {

  products: ClientInterface[] = [];
  selectedClient: ClientInterface | null = null;
  ref: DynamicDialogRef | undefined;

  // Store original client values
  originalClients: { [id: number]: ClientInterface } = {};

  constructor(
    private clientsService: ClientsService,
    private plantsService: PlantsService,
    private toastr: ToastrService,
    public dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    console.log('Loading clients...');
    this.clientsService.getClients().subscribe({
      next: (clients) => {
        console.log('Clients loaded:', clients);
        this.products = clients;
        // Store original client values
        clients.forEach(client => {
          if (client.id_client !== undefined) {
            this.originalClients[client.id_client] = { ...client };
          }
        });
      },
      error: (error) => {
        console.error('Failed to load clients', error);
        this.toastr.error('Failed to load clients');
      }
    });
  }

  addClient(): void {
    const newClient: Omit<ClientInterface, 'id_client'> = { client: '', holding: '' };
    this.clientsService.addClient(newClient).subscribe({
      next: (response) => {
        this.toastr.success('Client added successfully');
        // Add the new client at the top of the list
        const addedClient: ClientInterface = {
          id_client: response.id,
          client: newClient.client,
          holding: newClient.holding
        };
        this.products = [addedClient, ...this.products]; // Prepend the new client

        // Open the dialog for the newly added client
        this.openPlantDialog(addedClient);
      },
      error: (error) => {
        this.toastr.error('Error adding client');
      }
    });
  }

  deleteClient(client: ClientInterface, event: MouseEvent): void {
    event.stopPropagation(); 
    this.clientsService.deleteClient(client.id_client!).subscribe({
      next: () => {
        this.toastr.success('Client deleted successfully');
        this.loadClients(); 
      },
      error: (error) => {
        this.toastr.error('Error deleting client');
        console.error('Failed to delete client', error);
      }
    });
  }

  openPlantDialog(client: ClientInterface): void {
    this.plantsService.getPlantsByClientId(client.id_client!).subscribe({
      next: (plants) => {
        this.selectedClient = client;
        this.openDialog(client, plants);
      },
      error: (err) => {
        console.error('Failed to load plants', err);
        this.toastr.error('Failed to load plants for the selected client');
      }
    });
  }

  openDialog(client: ClientInterface, plants: PlantsInterface[]): void {
    this.ref = this.dialogService.open(PlantDialogComponent, {
      header: `${client.client}`,
      width: '70%',
      contentStyle: { "max-height": "500px", "overflow": "auto" },
      baseZIndex: 10000,
      data: {
        client: client,
        plants: plants
      }
    });

    this.ref.onClose.subscribe((message) => {
      if (message) {
        this.toastr.success(message);
      }
      this.loadClients(); // Reload clients to reflect changes
    });
  }

  // Method to revert client changes
  cancelEditClient(client: ClientInterface): void {
    if (client.id_client !== undefined) {
      const originalClient = this.originalClients[client.id_client];
      if (originalClient) {
        Object.assign(client, originalClient);
      }
    }
  }

  // Method to save client changes
  saveClient(client: ClientInterface): void {
    this.clientsService.updateClient(client).subscribe({
      next: () => {
        this.toastr.success('Client updated successfully');
        if (client.id_client !== undefined) {
          this.originalClients[client.id_client] = { ...client }; // Update original values after save
        }
      },
      error: (error) => {
        this.toastr.error('Error updating client');
        console.error('Error updating client', error);
      }
    });
  }

  clear(table: any): void {
    table.clear();
  }
}
