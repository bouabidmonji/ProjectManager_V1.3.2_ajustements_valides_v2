import * as pdfjsLib from '/vendor/pdfjs/build/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/build/pdf.worker.mjs';

const params = new URLSearchParams(window.location.search);
const fileUrl = params.get('file');
const canvas = document.getElementById('pageCanvas');
const context = canvas.getContext('2d', { alpha: false });
const status = document.getElementById('status');
const pageInfo = document.getElementById('pageInfo');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const zoomOut = document.getElementById('zoomOut');
const zoomIn = document.getElementById('zoomIn');
const fit = document.getElementById('fit');

let pdf = null;
let pageNumber = 1;
let zoom = 1;
let renderTask = null;
let fitToWidth = true;

function showError(error) {
  status.textContent = 'Impossible d’afficher le PDF : ' + (error?.message || String(error));
  status.classList.add('error');
}

function updateControls() {
  pageInfo.textContent = pdf ? pageNumber + ' / ' + pdf.numPages : '— / —';
  prev.disabled = !pdf || pageNumber <= 1;
  next.disabled = !pdf || pageNumber >= pdf.numPages;
  zoomOut.disabled = !pdf || zoom <= 0.5;
  zoomIn.disabled = !pdf || zoom >= 3;
  fit.disabled = !pdf;
}

async function renderPage() {
  if (!pdf) return;
  if (renderTask) {
    renderTask.cancel();
    renderTask = null;
  }
  status.textContent = 'Chargement de la page ' + pageNumber + '…';
  status.classList.remove('error');
  const page = await pdf.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const availableWidth = Math.max(280, document.getElementById('pages').clientWidth - 32);
  const scale = fitToWidth ? Math.min(3, availableWidth / base.width) : zoom;
  zoom = scale;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const viewport = page.getViewport({ scale: scale * ratio });
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  canvas.style.width = Math.ceil(viewport.width / ratio) + 'px';
  canvas.style.height = Math.ceil(viewport.height / ratio) + 'px';
  renderTask = page.render({ canvasContext: context, viewport });
  try {
    await renderTask.promise;
    status.textContent = '';
  } catch (error) {
    if (error?.name !== 'RenderingCancelledException') throw error;
  } finally {
    renderTask = null;
  }
  updateControls();
}

prev.addEventListener('click', () => { if (pageNumber > 1) { pageNumber--; renderPage().catch(showError); } });
next.addEventListener('click', () => { if (pdf && pageNumber < pdf.numPages) { pageNumber++; renderPage().catch(showError); } });
zoomOut.addEventListener('click', () => { fitToWidth = false; zoom = Math.max(0.5, zoom - 0.2); renderPage().catch(showError); });
zoomIn.addEventListener('click', () => { fitToWidth = false; zoom = Math.min(3, zoom + 0.2); renderPage().catch(showError); });
fit.addEventListener('click', () => { fitToWidth = true; renderPage().catch(showError); });
window.addEventListener('resize', () => { if (pdf && fitToWidth) renderPage().catch(showError); });

if (!fileUrl) {
  showError(new Error('Adresse du document absente.'));
} else {
  pdfjsLib.getDocument({ url: fileUrl, withCredentials: true }).promise
    .then(document => {
      pdf = document;
      status.textContent = document.numPages + ' page(s)';
      updateControls();
      return renderPage();
    })
    .catch(showError);
}
