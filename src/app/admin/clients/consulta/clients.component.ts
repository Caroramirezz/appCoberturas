import { Component, OnInit, ViewChild } from '@angular/core';
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

  clients: ClientInterface[] = [];
  filteredClients: ClientInterface[] = [];
  selectedClient: ClientInterface | null = null;
  ref: DynamicDialogRef | undefined;
  loading: boolean = true;

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
    this.clientsService.getClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.filteredClients = clients;
        this.loading = false;
        clients.forEach(client => {
          if (client.id_client !== undefined) {
            this.originalClients[client.id_client] = { ...client };
          }
        });
      },
      error: (error) => {
        this.toastr.error('Failed to load clients');
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filteredClients = this.clients.filter(client => 
      client.client.toLowerCase().includes(filterValue.toLowerCase()) ||
      client.holding.toLowerCase().includes(filterValue.toLowerCase())
    );
  }

  addClient(): void {
    const newClient: Omit<ClientInterface, 'id_client'> = { client: '', holding: '' };
    this.clientsService.addClient(newClient).subscribe({
      next: (response) => {
        const addedClient: ClientInterface = {
          id_client: response.id,
          client: newClient.client,
          holding: newClient.holding
        };
        this.clients = [addedClient, ...this.clients];
        this.filteredClients = this.clients;
        this.openPlantDialog(addedClient);
      },
      error: () => {
        this.toastr.error('Error adding client');
      }
    });
  }

  deleteClient(client: ClientInterface, event: MouseEvent): void {
    event.stopPropagation();
    if (client.id_client !== undefined) {
      this.clientsService.deleteClient(client.id_client).subscribe({
        next: () => {
          this.toastr.success('Client deleted successfully');
          this.loadClients();
        },
        error: (error) => {
          this.toastr.error('Error deleting client');
        }
      });
    }
  }

  openPlantDialog(client: ClientInterface): void {
    if (client.id_client !== undefined) {
      this.plantsService.getPlantsByClientId(client.id_client).subscribe({
        next: (plants) => {
          this.selectedClient = client;
          this.openDialog(client, plants);
        },
        error: () => {
          this.toastr.error('Failed to load plants for the selected client');
        }
      });
    }
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
      this.loadClients();
    });
  }

  clear(table: any): void {
    table.clear();
  }
}
