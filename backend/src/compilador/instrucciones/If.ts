import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class If extends Nodo {
    constructor(
        public condicion: Nodo,
        public bloqueTrue: Nodo[],
        public bloqueFalse: Nodo[] | Nodo | null,
        linea: number, columna: number
    ) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        const condicionEvaluada = this.condicion.ejecutar(entorno);

        if (condicionEvaluada) {
            const entornoLocal = new Entorno(entorno);
            for (const inst of this.bloqueTrue) {
                const resultado = inst.ejecutar(entornoLocal);
                if (resultado != null) return resultado; // Propagar Return/Break
            }
        } else if (this.bloqueFalse) {
            const entornoLocal = new Entorno(entorno);
            if (Array.isArray(this.bloqueFalse)) {
                for (const inst of this.bloqueFalse) {
                    const resultado = inst.ejecutar(entornoLocal);
                    if (resultado != null) return resultado;
                }
            } else {
                return this.bloqueFalse.ejecutar(entorno); // Else If
            }
        }
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        let dot = `${id} [label="If"];\n${nombrePadre} -> ${id};\n`;
        dot += this.condicion.obtenerAST(id);
        
        const idTrue = `nodo_${Singleton.getInstancia().contadorAst++}`;
        dot += `${idTrue} [label="Bloque True"];\n${id} -> ${idTrue};\n`;
        this.bloqueTrue.forEach(inst => { dot += inst.obtenerAST(idTrue); });

        return dot;
    }
}