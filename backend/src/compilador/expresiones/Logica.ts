import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class Logica extends Nodo {
    constructor(
        public izq: Nodo | null, // Puede ser null para el operador unario NOT (!)
        public operador: string, 
        public der: Nodo, 
        linea: number, columna: number
    ) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        const valDer = this.der.ejecutar(entorno);

        if (this.operador === '!') {
            return !valDer;
        }

        const valIzq = this.izq?.ejecutar(entorno);

        if (this.operador === '&&') return valIzq && valDer;
        if (this.operador === '||') return valIzq || valDer;
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        let dot = `${id} [label="${this.operador}"];\n${nombrePadre} -> ${id};\n`;
        if (this.izq) dot += this.izq.obtenerAST(id);
        dot += this.der.obtenerAST(id);
        return dot;
    }
}