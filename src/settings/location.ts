export class Location {
    coordinates: string;
    names: string[];

    constructor(
        coordinates: string, 
        names: string[],
    ) {
        this.coordinates = coordinates;
        this.names = names;
    }
}