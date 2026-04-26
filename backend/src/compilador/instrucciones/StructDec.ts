import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class StructDec extends Nodo {
    constructor(
        public id: string,
        public atributos: { id: string, tipo: string }[],
        linea: number, columna: number
    ) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        entorno.guardar(this.id, this.atributos, 'struct_template');
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        return `${id} [label="Struct\\n${this.id}"];\n${nombrePadre} -> ${id};\n`;
    }
}