import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Tipo } from "../ast/Tipo";
import { Singleton } from "../utils/Singleton";

export class Primitivo extends Nodo {
    constructor(public valor: any, public tipo: Tipo, linea: number, columna: number) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        return this.valor;
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        return `${id} [label="${this.valor}"];\n${nombrePadre} -> ${id};\n`;
    }
}