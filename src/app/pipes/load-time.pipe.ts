import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'renderloadTime'
})
export class RenderLoadTime implements PipeTransform {
    transform(value: number) {
        let time = '0ms';

        if (value) {
            if (value > 1000) {
                let milliseconds = Math.floor((value % 1000)),
                    seconds = Math.floor((value / 1000) % 60),
                    minutes = Math.floor((value / (1000 * 60)) % 60),
                    hours = Math.floor((value / (1000 * 60 * 60)) % 60);

                time = `${hours ? hours + 'h' : ''} ${minutes ? minutes + 'm' : ''} 
                        ${seconds ? seconds + 's' : ''} ${milliseconds ? milliseconds + 'ms' : ''}`;
            } else {
                time = `${value} ms`;
            }
        }

        return time;
    }

}