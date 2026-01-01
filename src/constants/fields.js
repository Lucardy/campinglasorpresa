export const CLIENTE_FIELDS = {
    ID: 'id',
    NOMBRE: 'nombre',
    APELLIDO: 'apellido',
    DOCUMENTO: 'documento',
    TELEFONO: 'telefono',
    MODELO_VEHICULO: 'modelo_vehiculo',
    PATENTE: 'patente',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
};

export const RESERVA_FIELDS = {
    ID: 'id',
    CLIENTE_ID: 'cliente_id',
    HOSPEDAJE_ID: 'hospedaje_id',
    FECHA_ENTRADA: 'fecha_entrada',
    FECHA_SALIDA: 'fecha_salida',
    CANTIDAD_PERSONAS: 'cantidad_personas',
    MONTO_TOTAL: 'monto_total',
    ESTADO: 'estado',
    OBSERVACIONES: 'observaciones',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
};

export const HOSPEDAJE_FIELDS = {
    ID: 'id',
    TIPO_HOSPEDAJE_ID: 'tipo_hospedaje_id',
    NUMERO: 'numero',
    CAPACIDAD: 'capacidad',
    PRECIO_BASE: 'precio_base',
    ESTADO: 'estado',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
};

export const TIPO_HOSPEDAJE_FIELDS = {
    ID: 'id',
    NOMBRE: 'nombre',
    DESCRIPCION: 'descripcion',
    CREATED_AT: 'created_at'
};

export const PAGO_FIELDS = {
    ID: 'id',
    RESERVA_ID: 'reserva_id',
    MONTO: 'monto',
    METODO_PAGO: 'metodo_pago',
    FECHA_PAGO: 'fecha_pago'
}; 