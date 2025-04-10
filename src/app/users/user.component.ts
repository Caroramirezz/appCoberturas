import { Component, OnInit } from '@angular/core';
import { UserService, User } from './user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = [
    'user',
    'newTrade',
    'uploadFile',
    'settled',
    'editTrade',
    'actionColumn',
    'catalogs'
  ];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  savePermissions() {
    this.users.forEach(user => {
      this.userService.updateUserPermissions(user).subscribe({
        next: () => console.log(`Updated user ${user.name}`),
        error: (err) => console.error(`Error updating user ${user.name}`, err)
      });
    });
  }
}
