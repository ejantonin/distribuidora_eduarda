// Variáveis globais para o estado do carrinho
let cart = [];
let total = 0;

/**
 * Função para buscar produtos do arquivo CSV
 */
async function fetchProducts() {
    try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vS7ZAIM3rY-YGbL5VgboFihr5CQUxwantMxdV3HxBIRIZNklPpFRLavF-hh2cMHW4q2pyzicr8mxCey/pub?output=csv');
        if (!response.ok) throw new Error('Arquivo CSV não encontrado');
        
        const data = await response.text();
        // Limpa linhas vazias e ignora o cabeçalho
        const rows = data.split('\n').slice(1).filter(row => row.trim() !== "");
        
        const vitrine = document.getElementById('vitrine');
        vitrine.innerHTML = ''; 

        rows.forEach(row => {
            const columns = row.split(','); // Use ';' se o seu Excel for padrão brasileiro
            if (columns.length >= 3) {
                const name = columns[0].trim();
                const price = parseFloat(columns[1].trim());
                const imgSrc = columns[2].trim();

                // Insere o card do produto no HTML
                vitrine.innerHTML += `
                    <div class="card">
                        <div class="img-box">
                            <img src="${imgSrc}" alt="${name}" onerror="this.src='https://via.placeholder.com/150?text=Bebida'">
                        </div>
                        <h3>${name}</h3>
                        <p class="price">R$ ${price.toFixed(2).replace('.', ',')}</p>
                        <button class="btn-add" onclick="addItem('${name}', ${price})">Adicionar</button>
                    </div>`;
            }
        });
    } catch (error) {
        console.error("Erro:", error);
        document.getElementById('vitrine').innerHTML = "<p>Erro ao carregar catálogo. Certifique-se de usar o Live Server.</p>";
    }
}

/**
 * Adiciona um item ao array do carrinho
 */
function addItem(name, price) {
    cart.push({ name, price });
    total += price;
    renderCart();
}

/**
 * Remove um item específico baseado no índice do array
 */
function removeItem(index) {
    total -= cart[index].price;
    cart.splice(index, 1);
    renderCart();
}

/**
 * Reseta o carrinho
 */
function limparCarrinho() {
    if(confirm("Deseja esvaziar o carrinho?")) {
        cart = [];
        total = 0;
        renderCart();
    }
}

/**
 * Atualiza a interface visual do carrinho (lista e total)
 */
function renderCart() {
    const lista = document.getElementById('lista-carrinho');
    const totalDisplay = document.getElementById('total-val');
    
    lista.innerHTML = '';
    cart.forEach((item, index) => {
        lista.innerHTML += `
            <li>
                <span>${item.name}</span>
                <div>
                    <span>R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                    <button onclick="removeItem(${index})" title="Remover item">✕</button>
                </div>
            </li>`;
    });

    totalDisplay.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

/**
 * Formata a mensagem e redireciona para o WhatsApp da loja
 */
function sendToWhatsApp() {
    if (cart.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    // Captura o método de pagamento
    const metodoPagamento = document.getElementById('metodo-pagamento').value;

    // VERIFICAÇÃO DE OBRIGATORIEDADE
    if (metodoPagamento === "") {
        alert("Por favor, selecione uma forma de pagamento antes de finalizar!");
        
        // Opcional: Abre a lista do carrinho caso ela esteja minimizada para o usuário ver o erro
        const details = document.getElementById('cart-details-area');
        if (details.classList.contains('cart-minimized')) {
            toggleCartList(); 
        }
        
        return; // Interrompe o envio
    }

    const myPhone = "554195327341"; 
    let message = "*--- NOVO PEDIDO ---*\n\n";
    
    cart.forEach((item, i) => {
        message += `*${i+1}.* ${item.name} - R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
    });
    
    message += `\n*TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*`;
    message += `\n*PAGAMENTO:* ${metodoPagamento}`;
    message += `\n\n_Pedido gerado pelo site._`;

    const url = `https://wa.me/${myPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Inicializa a vitrine ao carregar o arquivo
fetchProducts();

function toggleCartList() {
    const details = document.getElementById('cart-details-area');
    const icon = document.getElementById('cart-icon');
    
    details.classList.toggle('cart-minimized');
    
    // Altera a setinha
    if (details.classList.contains('cart-minimized')) {
        icon.innerText = '▲';
    } else {
        icon.innerText = '▼';
    }
}
