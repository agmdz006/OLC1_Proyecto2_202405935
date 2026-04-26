import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class Aritmetica extends Nodo {
    constructor(public izq: Nodo, public operador: string, public der: Nodo, linea: number, columna: number) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        let valIzq = this.izq.ejecutar(entorno);
        let valDer = this.der.ejecutar(entorno);

        // Prevención de nulls en caso de variables no inicializadas
        if (valIzq === null || valIzq === undefined) valIzq = "";
        if (valDer === null || valDer === undefined) valDer = "";

        if (this.operador === '+') {
            // Si alguno es string, fuerza la concatenación
            if (typeof valIzq === 'string' || typeof valDer === 'string') {
                return String(valIzq) + String(valDer);
            }
            return valIzq + valDer;
        }
        
        if (this.operador === '-') return valIzq - valDer;
        
        if (this.operador === '*') {
            if (typeof valIzq === 'string' && typeof valDer === 'number') return valIzq.repeat(valDer);
            if (typeof valIzq === 'number' && typeof valDer === 'string') return valDer.repeat(valIzq);
            return valIzq * valDer;
        }
        
        if (this.operador === '/') {
            if (valDer === 0) {
                Singleton.getInstancia().addError("Semántico", "División por cero", this.linea, this.columna);
                return null;
            }
            return valIzq / valDer;
        }

        if (this.operador === '%') {
            return valIzq % valDer;
        }
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        let dot = `${id} [label="Aritmetica\\n${this.operador}"];\n${nombrePadre} -> ${id};\n`;
        dot += this.izq.obtenerAST(id);
        dot += this.der.obtenerAST(id);
        return dot;
    }
}