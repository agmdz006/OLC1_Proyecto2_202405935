import { Simbolo } from "./Simbolo";
import { Singleton } from "../utils/Singleton";

export class Entorno {
    private variables: Map<string, Simbolo>;
    public anterior: Entorno | null;

    constructor(anterior: Entorno | null = null) {
        this.variables = new Map();
        this.anterior = anterior;
    }

    public guardar(id: string, valor: any, tipo: string): boolean {
        if (this.variables.has(id)) {
            Singleton.getInstancia().addError("Semántico", `La variable '${id}' ya existe.`, 0, 0);
            return false;
        }
        this.variables.set(id, new Simbolo(id, valor, tipo));
        return true;
    }

    public obtener(id: string): Simbolo | null {
        let actual: Entorno | null = this;
        while (actual !== null) {
            if (actual.variables.has(id)) {
                return actual.variables.get(id)!;
            }
            actual = actual.anterior;
        }
        Singleton.getInstancia().addError("Semántico", `La variable '${id}' no existe.`, 0, 0);
        return null;
    }

    public actualizar(id: string, valor: any): boolean {
        let actual: Entorno | null = this;
        while (actual !== null) {
            if (actual.variables.has(id)) {
                let simbolo = actual.variables.get(id)!;
                simbolo.valor = valor;
                return true;
            }
            actual = actual.anterior;
        }
        return false;
    }
}