import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class AccesoSlice extends Nodo {
    constructor(public expresion: Nodo, public indice: Nodo, linea: number, columna: number) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        const arreglo = this.expresion.ejecutar(entorno);
        const index = this.indice.ejecutar(entorno);

        if (!Array.isArray(arreglo)) {
            Singleton.getInstancia().addError("Semántico", "La variable no es un Slice.", this.linea, this.columna);
            return null;
        }

        // Retornamos el valor guardado en ese índice
        return arreglo[index];
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        return `${id} [label="Acceso Slice"];\n${nombrePadre} -> ${id};\n`;
    }
}