import { Component, OnInit } from '@angular/core';
import { GiphyService } from '../core/giphy.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {

  randomGiphUrl;

  constructor(private giphyService: GiphyService) { }

  ngOnInit(): void {
    this.giphyService.getGifs().subscribe((response: any) => {
      const randomGiph = Math.floor(Math.random() * 25);
      this.randomGiphUrl = response.data[randomGiph].images.original.url;
    });
  }

}
