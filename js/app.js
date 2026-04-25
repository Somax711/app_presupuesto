// DATOS 
let ingresos = JSON.parse(localStorage.getItem('ingresos_db')) || [
    new Ingreso('Salario', 1500000),
    new Ingreso('Venta Freelance', 200000)
];

let egresos = JSON.parse(localStorage.getItem('egresos_db')) || [
    new Egreso('Renta', 450000),
    new Egreso('Suscripciones', 15000)
];

// CARGA INICIAL
const cargarApp = () => {
    cargarCabecero();
    cargarIngresos();
    cargarEgresos();
}

const cargarCabecero = () => {
    let totalI = 0;
    ingresos.forEach(i => totalI += i.valor);
    let totalE = 0;
    egresos.forEach(e => totalE += e.valor);
    
    let presupuesto = totalI - totalE;
    let porcentaje = totalI > 0 ? totalE / totalI : 0;

    document.getElementById('presupuesto').innerHTML = formatoMoneda(presupuesto);
    document.getElementById('ingresos').innerHTML = formatoMoneda(totalI);
    document.getElementById('egresos').innerHTML = formatoMoneda(totalE);
    document.getElementById('porcentaje').innerHTML = formatoPorcentaje(porcentaje);
}

// FORMATOS
const formatoMoneda = (val) => val.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
const formatoPorcentaje = (val) => val.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 1 });

// RENDERIZADO
const cargarIngresos = () => {
    let html = '';
    for(let i of ingresos) {
        html += `
        <div class="elemento">
            <div class="elemento_descripcion">${i.descripcion}</div>
            <div class="derecha-list">
                <div class="elemento_valor val-income">+ ${formatoMoneda(i.valor)}</div>
                <button class='btn-eliminar' onclick='eliminarIngreso(${i.id})'><i class="fas fa-times-circle"></i></button>
            </div>
        </div>`;
    }
    document.getElementById('lista-ingresos').innerHTML = html;
}

const cargarEgresos = () => {
    let html = '';
    let totalI = 0;
    ingresos.forEach(i => totalI += i.valor);
    for(let e of egresos) {
        let por = totalI > 0 ? e.valor / totalI : 0;
        html += `
        <div class="elemento">
            <div class="elemento_descripcion">${e.descripcion}</div>
            <div class="derecha-list">
                <div class="elemento_valor val-expense">- ${formatoMoneda(e.valor)}</div>
                <span class="badge">${formatoPorcentaje(por)}</span>
                <button class='btn-eliminar' onclick='eliminarEgreso(${e.id})'><i class="fas fa-times-circle"></i></button>
            </div>
        </div>`;
    }
    document.getElementById('lista-egresos').innerHTML = html;
}

//  OPERACIONES
const guardarStorage = () => {
    localStorage.setItem('ingresos_db', JSON.stringify(ingresos));
    localStorage.setItem('egresos_db', JSON.stringify(egresos));
}

const agregarDato = () => {
    const forma = document.forms['forma'];
    const tipo = forma['tipo'].value;
    const desc = forma['descripcion'].value;
    const val = forma['valor'].value;

    if(desc !== '' && val !== '') {
        if(tipo === 'ingreso') ingresos.push(new Ingreso(desc, +val));
        else egresos.push(new Egreso(desc, +val));
        guardarStorage();
        cargarApp();
        forma.reset();
    }
}

const eliminarIngreso = (id) => {
    ingresos = ingresos.filter(i => i.id !== id);
    guardarStorage();
    cargarApp();
}

const eliminarEgreso = (id) => {
    egresos = egresos.filter(e => e.id !== id);
    guardarStorage();
    cargarApp();
}

// PDF 
const exportarPDF = () => {
    const inputs = document.querySelector(".input-section");
    const btnsEliminar = document.querySelectorAll(".btn-eliminar");
    const btnExport = document.querySelector(".export-actions");
    const content = document.querySelector(".main-wrapper");

    if(inputs) inputs.style.display = 'none';
    if(btnExport) btnExport.style.display = 'none';
    btnsEliminar.forEach(b => b.style.display = 'none');

    const opciones = {
        margin: [10, 10],
        filename: `Reporte_Presupuesto_${new Date().toLocaleDateString()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 3, 
            backgroundColor: '#0a0a0f', 
            useCORS: true 
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opciones).from(content).save().then(() => {
        if(inputs) inputs.style.display = 'block';
        if(btnExport) btnExport.style.display = 'block';
        btnsEliminar.forEach(b => b.style.display = 'flex');
    }).catch(err => {
        console.error("Error al generar PDF:", err);
        if(inputs) inputs.style.display = 'block';
        if(btnExport) btnExport.style.display = 'block';
        btnsEliminar.forEach(b => b.style.display = 'flex');
    });
}