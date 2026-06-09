import { Pipe, PipeTransform } from '@angular/core';
import { Gender } from '../interfaces';

@Pipe({
  name: 'generToValue',
})
export class GenerToValuePipe implements PipeTransform {

  transform(value: Gender): string {
    switch (value) {
      case 'male':
        return 'Male';
      case 'female':
        return 'Female';
      case 'notSpecify':
        return 'Not Specified';
      default:
        return 'Unknown';
    }

  }
}
