import { eventDispatcherInstance } from "../../@shared/event/event-dispatcher";
import AddressChangedEvent from "../event/address-changed.event";
import SendMessageWhenAddressIsChangedHandler from "../event/handler/send-message-when-address-is-changed.handler";
import Address from "../value-object/address";

export default class Customer {
  private _id: string;
  private _name: string = "";
  private _address!: Address;
  private _active: boolean = false;
  private _rewardPoints: number = 0;

  constructor(id: string, name: string) {
    this._id = id;
    this._name = name;
    this.validate();
    this.registerEvent();
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get rewardPoints(): number {
    return this._rewardPoints;
  }

  private registerEvent() {
    const eventHandler = new SendMessageWhenAddressIsChangedHandler();
    eventDispatcherInstance.register("AddressChangedEvent", eventHandler)
  }

  validate() {
    if (this._id.length === 0) {
      throw new Error("Id is required");
    }
    if (this._name.length === 0) {
      throw new Error("Name is required");
    }
  }

  changeName(name: string) {
    this._name = name;
    this.validate();
  }

  get Address(): Address {
    return this._address;
  }
  
  changeAddress(address: Address) {
    this._address = address;
    this.notify();
  }

  private notify() {
    const address = `${this._address._street}, ${this._address._number}, ${this._address._city} - ${this._address._zip}`
    const addressChangedEvent = new AddressChangedEvent(`Endereço do cliente: ${this._id}, ${this._name} alterado para: ${address}.`);
    eventDispatcherInstance.notify(addressChangedEvent)
  }

  isActive(): boolean {
    return this._active;
  }

  activate() {
    if (this._address === undefined) {
      throw new Error("Address is mandatory to activate a customer");
    }
    this._active = true;
  }

  deactivate() {
    this._active = false;
  }

  addRewardPoints(points: number) {
    this._rewardPoints += points;
  }

  set Address(address: Address) {
    this._address = address;
  }
}
