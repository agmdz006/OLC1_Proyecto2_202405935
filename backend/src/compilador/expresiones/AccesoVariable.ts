import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class AccesoVariable extends Nodo {
    constructor(public id: string, linea: number, columna: number) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        const simbolo = entorno.obtener(this.id);
        return simbolo ? simbolo.valor : null;
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        return `${id} [label="ID: ${this.id}"];\n${nombrePadre} -> ${id};\n`;
    }
}