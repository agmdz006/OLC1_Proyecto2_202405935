import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class Return extends Nodo {
    constructor(public valor: Nodo | null, linea: number, columna: number) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        // Envolvemos el valor en un objeto para diferenciar un 'return null' de una instrucción vacía
        const valorEvaluado = this.valor ? this.valor.ejecutar(entorno) : null;
        return { tipo: 'return', valor: valorEvaluado };
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        let dot = `${id} [label="Return"];\n${nombrePadre} -> ${id};\n`;
        if (this.valor) dot += this.valor.obtenerAST(id);
        return dot;
    }
}