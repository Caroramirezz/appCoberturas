import { Component, Input, OnInit } from '@angular/core';
import { ClientInterface } from '../interfaces/clients.interface';
import { PlantsInterface } from '../interfaces/plants.interface';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Table } from 'primeng/table';
import { ClientsService } from '../services/clients.service';
import { PlantsService } from '../services/plants.service';
import { MatDialog } from '@angular/material/dialog';
import { EditClientsDialog } from '../edit/edit-clients.component';
import { MatSidenavModule } from '@angular/material/sidenav';


@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {

  products: ClientInterface[] = [];
  plants: PlantsInterface[] = [];
  cols: any[] = [];
  _selectedColumns: any[] = [];
  _selectedColumnsFilter: any[] = [];
  selectedProducts3: ClientInterface[] = [];
  selectedClient: ClientInterface | null = null;

  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private clientsService: ClientsService,
    private plantsService: PlantsService,
    public sidenav: MatSidenavModule
  ) {
    this.cols = [
      { field: 'id_client', header: 'ID', type: "text" },
      { field: 'client', header: 'Client', type: "text" },
      { field: 'holding', header: 'Holding', type: "text" }
    ];
  }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientsService.getClients().subscribe({
      next: (clients) => {
        this.products = clients;
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Failed to load clients', error);
        this.toastr.error('Failed to load clients');
        this.spinner.hide();
      }
    });
  }

  onClientSelect(event: any): void {
    this.selectedClient = event.data;
    if (this.selectedClient) {
      this.loadPlantsForClient(this.selectedClient?.id_client);
    }
  }

  loadPlantsForClient(clientId?: number): void {
    if (!clientId) {
      console.log('No clientId provided');
      this.toastr.error('No client selected');
      return;
    }
    this.plantsService.getPlantsByClientId(clientId).subscribe({
      next: (plants) => {
        console.log('Plants loaded:', plants);
        this.plants = plants;
      },
      error: (err) => {
        console.error('Failed to load plants', err);
        this.toastr.error('Failed to load plants for the selected client');
      }
    });
  }  

  toggleEdit(client: ClientInterface, value: boolean, event?: MouseEvent): void {
    if (event) {
        event.stopPropagation();  // Stop the event from bubbling up
    }
    client.editing = value;

    if (!value) {
        // Save the client here or handle cancel
        this.saveClient(client);
    }
}

onRowSelect(event: any): void {
    if (!event.data.editing) {
        this.selectedClient = event.data;
        this.loadPlantsForClient(this.selectedClient?.id_client);
    }
}

selectRow(client: ClientInterface): void {
  if (!client.editing) {
      this.selectedClient = client;
      this.loadPlantsForClient(client.id_client);
  }
}


  

  saveClient(client: ClientInterface): void {
    if (client.editing) {
      this.clientsService.updateClient(client).subscribe({
        next: (response) => {
          this.toastr.success('Client updated successfully');
          client.editing = false;  // Turn off edit mode on success
        },
        error: (error) => {
          this.toastr.error('Error updating client');
          console.error('Failed to update client', error);
        }
      });
    }
  }

deleteClient(client: ClientInterface): void {
    // Call service to delete client
    this.clientsService.deleteClient(client.id_client).subscribe({
        next: () => {
            this.toastr.success('Client deleted successfully');
            this.loadClients();  // Reload clients to reflect changes
        },
        error: (error) => {
            this.toastr.error('Error deleting client');
            console.error('Failed to delete client', error);
        }
    });
}

savePlant(plant: PlantsInterface): void {
    // Call service to update plant
    this.plantsService.updatePlant(plant).subscribe({
        next: () => {
            this.toastr.success('Plant updated successfully');
            this.loadPlantsForClient(this.selectedClient!.id_client);  // Reload plants for current client
            plant.editing = false;
        },
        error: (error) => {
            this.toastr.error('Error updating plant');
            console.error('Failed to update plant', error);
        }
    });
}

deletePlant(plant: PlantsInterface): void {
    // Call service to delete plant
    this.plantsService.deletePlant(plant.id_plant).subscribe({
        next: () => {
            this.toastr.success('Plant deleted successfully');
            this.loadPlantsForClient(this.selectedClient!.id_client);  // Reload plants for current client
        },
        error: (error) => {
            this.toastr.error('Error deleting plant');
            console.error('Failed to delete plant', error);
        }
    });
}


  

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  clear(table: Table): void {
    table.clear();
    this.selectedProducts3 = [];
  }

//   openDialog(flag: string, row: any): void {
//     this.dialog.open(EditClientsDialog, {
//       data: {
//         tipo: flag,
//         data: row
//       },
//     });

//     dialogRef.afterClosed().subscribe(result => {
//       console.log(result);
//     });    
//   }
}
