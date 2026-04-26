import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class Relacional extends Nodo {
    constructor(public izq: Nodo, public operador: string, public der: Nodo, linea: number, columna: number) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        const valIzq = this.izq.ejecutar(entorno);
        const valDer = this.der.ejecutar(entorno);

        switch (this.operador) {
            case '==': return valIzq == valDer;
            case '!=': return valIzq != valDer;
            case '<': return valIzq < valDer;
            case '<=': return valIzq <= valDer;
            case '>': return valIzq > valDer;
            case '>=': return valIzq >= valDer;
            default:
                Singleton.getInstancia().addError("Semántico", `Operador relacional ${this.operador} no soportado.`, this.linea, this.columna);
                return false;
        }
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        let dot = `${id} [label="${this.operador}"];\n${nombrePadre} -> ${id};\n`;
        dot += this.izq.obtenerAST(id) + this.der.obtenerAST(id);
        return dot;
    }
}