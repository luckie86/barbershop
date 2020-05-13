import { Component, OnInit } from '@angular/core';
import { GiphyService } from '../core/giphy.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {

  randomGifUrl;

  constructor(private giphyService: GiphyService) { }

  ngOnInit(): void {
    this.giphyService.getGifs().subscribe((response: any) => {
      const randomGifNumber = Math.floor(Math.random() * 25);
      this.randomGifUrl = response?.data[randomGifNumber]?.images?.original?.url;
    });
  }

}
