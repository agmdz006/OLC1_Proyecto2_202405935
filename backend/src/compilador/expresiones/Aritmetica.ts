import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class Aritmetica extends Nodo {
    constructor(public izq: Nodo, public operador: string, public der: Nodo, linea: number, columna: number) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        const valIzq = this.izq.ejecutar(entorno);
        const valDer = this.der.ejecutar(entorno);

        if (this.operador === '+') {
            // Si alguno de los dos es string, forzamos concatenación
            if (typeof valIzq === 'string' || typeof valDer === 'string') {
                return valIzq.toString() + valDer.toString();
            }
            return valIzq + valDer;
        }
        
        if (this.operador === '-') return valIzq - valDer;
        
        if (this.operador === '*') {
            // Si es String * Número (Ej. "hola" * 3)
            if (typeof valIzq === 'string' && typeof valDer === 'number') {
                return valIzq.repeat(valDer);
            }
            // Si es Número * String (Ej. 5 * "#")
            if (typeof valIzq === 'number' && typeof valDer === 'string') {
                return valDer.repeat(valIzq);
            }
            return valIzq * valDer;
        }
        
        if (this.operador === '/') {
            if (valDer === 0) {
                Singleton.getInstancia().addError("Semántico", "División por cero", this.linea, this.columna);
                return null;
            }
            return valIzq / valDer;
        }

        // ¡AQUÍ ESTÁ EL SALVAVIDAS! El operador Módulo
        if (this.operador === '%') {
            return valIzq % valDer;
        }
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        let dot = `${id} [label="${this.operador}"];\n${nombrePadre} -> ${id};\n`;
        dot += this.izq.obtenerAST(id) + this.der.obtenerAST(id);
        return dot;
    }
}