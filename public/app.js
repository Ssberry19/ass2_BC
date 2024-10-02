
let web3;
let contract;
let accounts;

const contractAddress = "0xbD14fA73121da951f0e0ec36DfCCb50a1FC8e6Ee"; 
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "listModel",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			}
		],
		"name": "purchaseModel",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "rating",
				"type": "uint8"
			}
		],
		"name": "rateModel",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "withdrawFunds",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getModelCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			}
		],
		"name": "getModelDetails",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "modelPurchased",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "models",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "ratingCount",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "totalRating",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];



window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        accounts = await web3.eth.getAccounts();
        contract = new web3.eth.Contract(contractABI, contractAddress);


        loadModels();
    } else {
        alert('Please install MetaMask to use this app');
    }
});

async function loadModels() {
    const modelListElement = document.getElementById('modelList');
    modelListElement.innerHTML = '';

    const modelCount = await contract.methods.models.length().call(); 

    for (let i = 0; i < modelCount; i++) {
        const model = await contract.methods.getModelDetails(i).call();
        const averageRating = model[4]; 
        const modelCard = document.createElement('div');
        modelCard.className = 'col-md-4 mb-4'; 
        modelCard.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${model[0]}</h5>
                    <p class="card-text">${model[1]}</p>
                    <p class="card-text">Price: ${model[2]} Wei</p>
                    <p class="card-text">Creator: ${model[3]}</p>
                    <p class="card-text">Average Rating: ${averageRating.toFixed(2)}</p>
                    <button class="btn btn-info" onclick="viewModelDetails(${i})">View Details</button>
                </div>
            </div>
        `;
        modelListElement.appendChild(modelCard);
    }
}



document.getElementById('listModelForm').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('modelName').value;
    const description = document.getElementById('modelDescription').value;
    const price = web3.utils.toWei(document.getElementById('modelPrice').value, 'ether'); 

    const accounts = await web3.eth.getAccounts();
    await contract.methods.listModel(name, description, price).send({ from: accounts[0] });

    alert("Model listed successfully!");
    loadModels();
};

document.getElementById('purchaseButton').onclick = async () => {
    const modelId = document.getElementById('purchaseModelId').value;
    const price = await contract.methods.models(modelId).call().then(model => model.price);

    const accounts = await web3.eth.getAccounts();
    await contract.methods.purchaseModel(modelId).send({ from: accounts[0], value: price });

    alert("Model purchased successfully!");
};

document.getElementById('rateButton').onclick = async () => {
    const modelId = document.getElementById('rateModelId').value;
    const rating = document.getElementById('modelRating').value;

    const accounts = await web3.eth.getAccounts();
    await contract.methods.rateModel(modelId, rating).send({ from: accounts[0] });

    alert("Model rated successfully!");
};

document.getElementById('viewButton').onclick = async () => {
    const modelId = document.getElementById('viewModelId').value;
    const details = await contract.methods.getModelDetails(modelId).call();
    
    const detailsDiv = document.getElementById('modelDetails');
    detailsDiv.innerHTML = `
        <strong>Name:</strong> ${details[0]} <br>
        <strong>Description:</strong> ${details[1]} <br>
        <strong>Price:</strong> ${web3.utils.fromWei(details[2], 'ether')} ETH <br>
        <strong>Creator:</strong> ${details[3]} <br>
        <strong>Average Rating:</strong> ${details[4]} <br>
    `;
};

document.getElementById('withdrawButton').onclick = async () => {
    const accounts = await web3.eth.getAccounts();
    await contract.methods.withdrawFunds().send({ from: accounts[0] });
    alert("Funds withdrawn successfully!");
};


async function loadModels() {
    const modelCount = await contract.methods.getModelCount().call();
    const modelList = document.getElementById('modelList');
    modelList.innerHTML = '';

    for (let i = 0; i < modelCount; i++) {
        const model = await contract.methods.getModelDetails(i).call();
        const listItem = document.createElement('li');
        listItem.textContent = `Name: ${model[0]}, Price: ${web3.utils.fromWei(model[2], 'ether')} ETH`;
        modelList.appendChild(listItem);
    }
}
async function withdrawFunds() {
    try {
        const accounts = await web3.eth.getAccounts();
        
        const receipt = await contract.methods.withdrawFunds().send({ from: accounts[0] });
        
       
        console.log('Transaction successful:', receipt);
        alert('Funds withdrawn successfully');
    } catch (error) {
        
        console.error('Error:', error);
        alert('Error: Only the contract owner can withdraw funds or an error occurred');
    }
}

window.onload = loadModels;