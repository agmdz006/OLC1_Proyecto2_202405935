import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class ForRange extends Nodo {
    constructor(
        public idIndice: string | null, 
        public idValor: string, 
        public arregloExpr: Nodo, 
        public instrucciones: Nodo[], 
        linea: number, columna: number
    ) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        const arreglo = this.arregloExpr.ejecutar(entorno);

        
        if (!Array.isArray(arreglo) && typeof arreglo !== 'string') {
            Singleton.getInstancia().addError("Semántico", "For Range solo itera sobre Slices o Strings", this.linea, this.columna);
            return null;
        }

        // Esta parte funciona idéntico tanto para Arrays como para Strings
        for (let i = 0; i < arreglo.length; i++) {
            const entornoLocal = new Entorno(entorno);
            
            // Declaramos la variable del valor (ej. for _, valor :=)
            entornoLocal.guardar(this.idValor, arreglo[i], "any");
            
            // Si el usuario pidió el índice (ej. for i, valor :=)
            if (this.idIndice) {
                entornoLocal.guardar(this.idIndice, i, "int");
            }

            for (const inst of this.instrucciones) {
                const resultado = inst.ejecutar(entornoLocal);
                if (resultado === 'break') return null;
                if (resultado === 'continue') break;
                if (resultado != null) return resultado;
            }
        }
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        return `${id} [label="For Range"];\n${nombrePadre} -> ${id};\n`;
    }
}