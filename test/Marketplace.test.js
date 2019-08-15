const Marketplace = artifacts.require('./Marketplace.sol');

require('chai')
	.use(require('chai-as-promised'))
	.should();

contract('Marketplace', ([deployer, seller, buyer]) => {
	let marketplace;

	before(async () => {
		marketplace = await Marketplace.deployed();
	});

	describe('deployment', async () => {
		it('deploys successfully', async () => {
			const address = await marketplace.address;
			assert.notEqual(address, 0x0);
			assert.notEqual(address, '');
			assert.notEqual(address, null);
			assert.notEqual(address, undefined);
		});
	});

	describe('product creation', async () => {
		let result, productCount;

		before(async () => {
			result = await marketplace.createProduct("First Product", web3.utils.toWei('1', 'Ether'), { from: seller });
			productCount = await marketplace.productCount();
		});

		it('creates products', async () => {
			assert.equal(productCount, 1);
			const event = result.logs[0].args;
			assert.equal(event.id.toNumber(), productCount.toNumber(), 'ID is correct');
			assert.equal(event.name, 'First Product', 'name is correct');
			assert.equal(event.price, '1000000000000000000', 'price is correct');
			assert.equal(event.owner, seller, 'owner is correct');
			assert.equal(event.purchased, false, 'purchased is correct');
		});

		it('product must have a name', async () => {
			await marketplace.createProduct("", web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
		});

		it('product must have a price', async () => {
			await marketplace.createProduct("First Product", 0, { from: seller }).should.be.rejected;
		});

		it('lists products', async () => {
			const product = await marketplace.products(productCount);
			assert.equal(product.id.toNumber(), productCount.toNumber(), 'ID is correct');
			assert.equal(product.name, 'First Product', 'name is correct');
			assert.equal(product.price, '1000000000000000000', 'price is correct');
			assert.equal(product.owner, seller, 'owner is correct');
			assert.equal(product.purchased, false, 'purchased is correct');
		});
	});

	describe('product selling', async () => {
		let result, productCount;

		before(async () => {
			productCount = await marketplace.productCount();
		});

		it('sells product', async () => {
			result = await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') });
			const event = result.logs[0].args;
			assert.equal(event.id.toNumber(), productCount.toNumber(), 'ID is correct');
			assert.equal(event.name, 'First Product', 'name is correct');
			assert.equal(event.price, '1000000000000000000', 'price is correct');
			assert.equal(event.owner, buyer, 'owner is correct');
			assert.equal(event.purchased, true, 'purchased is correct');
		});

		it('payout value is correct', async () => {
			result = await marketplace.getMyBalance({ from: seller });
			assert.equal(result, web3.utils.toWei('1', 'Ether'));
		});

		it('payout works correctly', async () => {
			let oldBalance, newBalance, payout;
			//get amount seller can withdraw
			payout = await marketplace.getMyBalance({ from: seller });
			payout = new web3.utils.BN(payout);
			//get seller balance before withdraw
			oldBalance = await web3.eth.getBalance(seller);
			oldBalance = new web3.utils.BN(oldBalance);

			//withdraw
			result = await marketplace.withdraw({ from: seller });

			//get new balance after withdraw
			newBalance = await web3.eth.getBalance(seller);
			newBalance = new web3.utils.BN(newBalance);

			//get withdraw tx cost
			const tx = await web3.eth.getTransaction(result.tx);
			const gasPrice = new web3.utils.BN(tx.gasPrice);
			const gasUsed = new web3.utils.BN(result.receipt.gasUsed);
			const txCost = gasPrice.mul(gasUsed);
			
			//seller's expected balance
			const expected = oldBalance.add(payout).sub(txCost);

			assert.equal(newBalance.toString(), expected.toString());
		});

		it('buying non-existing product fails', async () => {
			await marketplace.purchaseProduct(123456, {from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
		});

		it('too little Ether fails', async () => {
			await marketplace.purchaseProduct(productCount, {from: buyer, value: web3.utils.toWei('0.5', 'Ether')}).should.be.rejected;
		});

		it('trying to buy product twice fails', async () => {
			await marketplace.purchaseProduct(productCount, {from: deployer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
		});

		it('product owner tries to buy product fails', async () => {
			await marketplace.purchaseProduct(productCount, {from: seller, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
		});
	});
});