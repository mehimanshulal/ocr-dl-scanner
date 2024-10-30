import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OcrReaderFormComponent } from './ocr-reader-form.component';

describe('OcrReaderFormComponent', () => {
  let component: OcrReaderFormComponent;
  let fixture: ComponentFixture<OcrReaderFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OcrReaderFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OcrReaderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
