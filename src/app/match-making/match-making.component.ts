import { AuthComponent } from './../auth/auth.component';
import { AuthService } from './../auth.service';
import { Player } from '../models/player';
import { Room } from '../models/room';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import 'rxjs/Rx';

@Component({
  selector: 'app-match-making',
  templateUrl: './match-making.component.html',
  styleUrls: ['./match-making.component.css'],
})
export class MatchMakingComponent implements OnInit {

  constructor(
    private authService: AuthService, private db: AngularFirestore, private router: Router) { }

  ngOnInit() {
    this.getRooms();
  }

  getRooms() {
    const roomsCollection = this.db.collection<Room>('rooms');

    const snapshot = roomsCollection.snapshotChanges().take(1).subscribe((snapshot) => {
      const player = new Player();
      player.name = this.authService.name;
      player.action = ['init action'];
      player.roundWin = 0;
      player.victory = 0;

      for (const snapshotItem of snapshot) {
        const roomId = snapshotItem.payload.doc.id;
        const room = snapshotItem.payload.doc.data() as Room;

        if (room.players.length === 1) {
          room.players.push(player);
          this.db.doc('rooms/' + roomId).update(JSON.parse(JSON.stringify(room)));
          this.router.navigate(['game', roomId, player.name]);
          return;
        }
      }

      const room = new Room();
      room.turn = 1;
      room.count = 0;
      room.matchLog = ['Game history : '];
      room.players = [player];
      this.db.collection('rooms')
        .add(JSON.parse(JSON.stringify(room)))
        .then((doc) => {
          this.router.navigate(['game', doc.id, player.name]);
        });
    });
  }
}
