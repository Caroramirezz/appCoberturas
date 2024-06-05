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
      },
      error: (error) => {
        console.error('Failed to load clients', error);
        this.toastr.error('Failed to load clients');
      }
    });
  }

  onRowEditInit(client: ClientInterface): void {
    console.log('Row edit initialized', client);
  }

  onRowEditSave(client: ClientInterface): void {
    this.clientsService.updateClient(client).subscribe({
      next: () => {
        this.toastr.success('Client updated successfully');
      },
      error: (error) => {
        this.toastr.error('Error updating client');
        console.error('Error updating client', error);
      }
    });
  }

  onRowEditCancel(client: ClientInterface, index: number): void {
    console.log('Row edit cancelled', client, index);
  }

  addClient(): void {
    const newClient: ClientInterface = { id_client: 0, client: '', holding: '' };
    this.products = [...this.products, newClient];
  }

  deleteClient(client: ClientInterface): void {
    this.clientsService.deleteClient(client.id_client).subscribe({
      next: () => {
        this.toastr.success('Client deleted successfully');
        this.loadClients(); // Reload clients to reflect changes
      },
      error: (error) => {
        this.toastr.error('Error deleting client');
        console.error('Failed to delete client', error);
      }
    });
  }

  openPlantDialog(client: ClientInterface): void {
    console.log('Loading plants for clientId:', client.id_client);
    this.plantsService.getPlantsByClientId(client.id_client).subscribe({
      next: (plants) => {
        console.log('Plants loaded for client:', plants);
        this.selectedClient = client;
        this.openDialog(plants);
      },
      error: (err) => {
        console.error('Failed to load plants', err);
        this.toastr.error('Failed to load plants for the selected client');
      }
    });
  }

  openDialog(plants: PlantsInterface[]): void {
    if (this.selectedClient) {
      console.log('Opening dialog for client:', this.selectedClient); // Log client data
      this.ref = this.dialogService.open(PlantDialogComponent, {
        header: `Plants for ${this.selectedClient.client}`,
        width: '70%',
        contentStyle: { "max-height": "500px", "overflow": "auto" },
        baseZIndex: 10000,
        data: {
          client: this.selectedClient,
          plants: plants
        }
      });

      this.ref.onClose.subscribe((message) => {
        if (message) {
          this.toastr.success(message);
        }
      });
    }
  }
}
