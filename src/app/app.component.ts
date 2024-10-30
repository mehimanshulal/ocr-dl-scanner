import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OcrReaderFormComponent } from './ocr-reader-form/ocr-reader-form.component';
 
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OcrReaderFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'ocr-reader';
}
