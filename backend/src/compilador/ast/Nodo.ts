import { Entorno } from "../entorno/Entorno";

export abstract class Nodo {
    public linea: number;
    public columna: number;

    constructor(linea: number, columna: number) {
        this.linea = linea;
        this.columna = columna;
    }

    abstract ejecutar(entorno: Entorno): any;
    abstract obtenerAST(nombrePadre: string): string;
}