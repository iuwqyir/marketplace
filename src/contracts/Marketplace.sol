pragma solidity ^0.5.0;

contract Marketplace {
	uint public productCount = 0;
	mapping(uint => Product) public products;
	mapping(address => uint) private payouts;

	struct Product {
		uint id;
		string name;
		uint price;
		address payable owner;
		bool purchased;
	}

	event ProductCreated(
		uint id,
		string name,
		uint price,
		address payable owner,
		bool purchased
	);

	event ProductPurchased(
		uint id,
		string name,
		uint price,
		address payable owner,
		bool purchased
	);
	
	function getMyBalance() public view returns(uint) {
		return payouts[msg.sender];
	}
	
	function withdraw() public {
		require(payouts[msg.sender] > 0);
		address(msg.sender).transfer(payouts[msg.sender]);
	}
	

	function createProduct(string memory _name, uint _price) public {
		require(bytes(_name).length > 0);
		require(_price > 0);
		productCount++;
		products[productCount] = Product(productCount, _name, _price, msg.sender, false);
		emit ProductCreated(productCount, _name, _price, msg.sender, false);
	}

	function purchaseProduct(uint _id) public payable {
		//check that ID is valid
		require (_id > 0 && _id <= productCount);		
		Product memory _product = products[_id];
		//check that product has not been purchased
		require(!_product.purchased);
		//check paid amount is correct
		require(msg.value >= _product.price);
		address payable _seller = _product.owner;
		//check that buyer is not seller
		require(_seller != msg.sender);
		_product.owner = msg.sender;
		_product.purchased = true;
		products[_id] = _product;
		payouts[_seller] = msg.value;
		emit ProductPurchased(_id, _product.name, _product.price, msg.sender, true);
	}
}