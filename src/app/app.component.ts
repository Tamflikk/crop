import { ChangeDetectionStrategy, Component, ViewChild, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { ImageCroppedEvent, ImageCropperComponent, LoadedImage } from 'ngx-image-cropper';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  @ViewChild('cropper') cropper!: ImageCropperComponent;
  
  title = 'workspace-app';
  
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper = false;
  isModalVisible = false;
  rotation = 0;
  scale = 1;
  aspectRatio: number | null = 4 / 3;
  
  fileList: NzUploadFile[] = [];
  
  aspectRatios = [
    { label: '4:3', value: 4/3 },
    { label: '16:9', value: 16/9 },
    { label: '1:1', value: 1 },
    { label: '2:3', value: 2/3 },
    { label: 'Libre', value: null }
  ];
  
  constructor(
    public cdr: ChangeDetectorRef,
    private message: NzMessageService
  ) {}
  
  resetImage(): void {
    this.fileList = [];
    this.croppedImage = '';
    this.cdr.markForCheck();
  }
  
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.isModalVisible = true;
    this.rotation = 0;
    this.scale = 1;
    this.cdr.markForCheck();
  }
  
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.cdr.markForCheck();
  }
  
  loadImageFailed() {
    this.message.error('Error al cargar la imagen. Intente con otro formato.');
    this.handleCancel();
  }
  
  rotateLeft(): void {
    this.rotation -= 90;
    this.cdr.markForCheck();
  }
  
  rotateRight(): void {
    this.rotation += 90;
    this.cdr.markForCheck();
  }
  
  zoomIn(): void {
    this.scale += 0.1;
    this.cdr.markForCheck();
  }
  
  zoomOut(): void {
    if (this.scale > 0.1) {
      this.scale -= 0.1;
    }
    this.cdr.markForCheck();
  }
  
  zoomChange(value: number | number[]): void {
    const zoomValue = Array.isArray(value) ? value[0] : value;
    this.scale = zoomValue / 100;
    this.cdr.markForCheck();
  }
  
  changeAspectRatio(ratio: number | null): void {
    this.aspectRatio = ratio;
  }
  
  handleOk(): void {
    if (!this.croppedImage) {
      this.message.warning('Por favor recorte una imagen primero');
      return;
    }
    this.isModalVisible = false;
    this.message.success('Imagen recortada y guardada');
    this.cdr.markForCheck();
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.imageChangedEvent = null;
    this.croppedImage = '';
    this.cdr.markForCheck();
  }
  
  beforeUpload = (file: NzUploadFile): boolean => {
    const isImage = file.type?.startsWith('image/');
    if (!isImage) {
      this.message.error('Solo puede subir archivos de imagen');
      return false;
    }
    
    const isLt5M = file.size! / 1024 / 1024 < 5;
    if (!isLt5M) {
      this.message.error('La imagen debe pesar menos de 5MB');
      return false;
    }
    
    this.fileList = [file];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.fileChangeEvent({target: {files: [file]}});
    };
    reader.readAsDataURL(file as any);
    return false; 
  }
  
  downloadCroppedImage(): void {
    if (!this.croppedImage) {
      this.message.warning('No hay imagen para descargar');
      return;
    }
    
    const link = document.createElement('a');
    link.href = this.croppedImage;
    link.download = 'imagen-recortada.png';
    link.click();
  }
}