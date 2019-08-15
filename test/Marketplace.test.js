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

	describe('product', async () => {
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
			await await marketplace.createProduct("", web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
		});

		it('product must have a price', async () => {
			await await marketplace.createProduct("First Product", 0, { from: seller }).should.be.rejected;
		});
	});
});