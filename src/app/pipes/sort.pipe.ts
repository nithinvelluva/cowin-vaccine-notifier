import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sortBy' })
export class SortByPipe implements PipeTransform {
  transform(records: Array<any>, args?: any): any {
    let direction = args.direction == true ? -1 : 1;
    return records.sort((a, b) => {
      if (a[args.property] < b[args.property]) {
        return -1 * direction;
      }
      else if (a[args.property] > b[args.property]) {
        return 1 * direction;
      }
      else {
        return 0;
      }
    }
    );
  };
}