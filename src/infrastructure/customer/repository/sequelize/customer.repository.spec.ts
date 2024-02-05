import { Sequelize } from "sequelize-typescript";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import CustomerModel from "./customer.model";
import CustomerRepository from "./customer.repository";

describe("Customer repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([CustomerModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe("when a customer is created", () => {
    const sut = async () => {
      const customerRepository = new CustomerRepository();
      const customer = new Customer("123", "Customer 1");
      const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
      customer.Address = address;
      await customerRepository.create(customer);

      return customer
    }

    it("should persist a customer", async () => {
      const customer = await sut();
      const address = customer.Address;

      const customerModel = await CustomerModel.findOne({ where: { id: "123" } });

      expect(customerModel.toJSON()).toStrictEqual({
        id: "123",
        name: customer.name,
        active: customer.isActive(),
        rewardPoints: customer.rewardPoints,
        street: address.street,
        number: address.number,
        zipcode: address.zip,
        city: address.city,
      });
    });
  
    it("should notify all event handlers", async () => {
      const spyLog = jest.spyOn(console, "log")

      await sut();

      expect(spyLog).toHaveBeenCalledWith("Esse é o primeiro console.log do evento: CustomerCreated")
      expect(spyLog).toHaveBeenCalledWith("Esse é o segundo console.log do evento: CustomerCreated")
    })
  })

  describe('when a customer is changed', () => {
    it("should update a customer", async () => {
      const customerRepository = new CustomerRepository();
      const customer = new Customer("123", "Customer 1");
      const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
      customer.Address = address;
      await customerRepository.create(customer);

      customer.changeName("Customer 2");
      await customerRepository.update(customer);
      const customerModel = await CustomerModel.findOne({ where: { id: "123" } });

      expect(customerModel.toJSON()).toStrictEqual({
        id: "123",
        name: customer.name,
        active: customer.isActive(),
        rewardPoints: customer.rewardPoints,
        street: address.street,
        number: address.number,
        zipcode: address.zip,
        city: address.city,
      });
    });

    it('should notify the changed address', async () => {
      const spyLog = jest.spyOn(console, 'log');
      const customer = new Customer("123", "Customer 1");
      const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
      
      customer.changeAddress(address)

      const addressChanged = `${address.street}, ${address.number}, ${address.city} - ${address.zip}`
      const result = `Endereço do cliente: ${customer.id}, ${customer.name} alterado para: ${addressChanged}.`

      expect(spyLog).toHaveBeenCalledWith(result)
    })
  });

  it("should find a customer", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.Address = address;
    await customerRepository.create(customer);

    const customerResult = await customerRepository.find(customer.id);

    expect(customer).toStrictEqual(customerResult);
  });

  it("should throw an error when customer is not found", async () => {
    const customerRepository = new CustomerRepository();

    expect(async () => {
      await customerRepository.find("456ABC");
    }).rejects.toThrow("Customer not found");
  });

  it("should find all customers", async () => {
    const customerRepository = new CustomerRepository();
    const customer1 = new Customer("123", "Customer 1");
    const address1 = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer1.Address = address1;
    customer1.addRewardPoints(10);
    customer1.activate();

    const customer2 = new Customer("456", "Customer 2");
    const address2 = new Address("Street 2", 2, "Zipcode 2", "City 2");
    customer2.Address = address2;
    customer2.addRewardPoints(20);

    await customerRepository.create(customer1);
    await customerRepository.create(customer2);

    const customers = await customerRepository.findAll();

    expect(customers).toHaveLength(2);
    expect(customers).toContainEqual(customer1);
    expect(customers).toContainEqual(customer2);
  });
});
