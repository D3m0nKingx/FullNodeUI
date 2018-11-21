import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ApiService } from '../../shared/services/api.service';
import { ModalService } from '../../shared/services/modal.service';
import { AddNewAddressComponent } from '../address-book/modals/add-new-address/add-new-address.component';
import { AddressLabel } from '../../shared/classes/address-label';

import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-address-book',
    templateUrl: './address-book.component.html',
    styleUrls: ['./address-book.component.css']
})
export class AddressBookComponent implements OnInit, OnDestroy {
    constructor(private apiService: ApiService, private clipboardService: ClipboardService, private modalService: NgbModal, private genericModalService: ModalService) { }

    private addressBookSubcription: Subscription;
    addresses: AddressLabel[];

    ngOnInit() {
      this.startSubscriptions();
    }

    ngOnDestroy() {
      this.cancelSubscriptions();
    }

    private startSubscriptions() {
      this.getAddressBookAddresses();
    }

    private cancelSubscriptions() {
      if (this.addressBookSubcription) {
        this.addressBookSubcription.unsubscribe();
      }
    }

    private getAddressBookAddresses() {
      this.addressBookSubcription = this.apiService.getAddressBookAddresses()
        .subscribe(
          response => {
            if (response.status >= 200 && response.status < 400) {
              this.addresses = null;
              if (response.json().addresses[0]) {
                this.addresses = [];
                let addressResponse = response.json().addresses;
                for (let address of addressResponse) {
                  this.addresses.push(new AddressLabel(address.label, address.address));
                }
              }
            }
          },
          error => {
            console.log(error);
            if (error.status === 0) {
              this.cancelSubscriptions();
              this.genericModalService.openModal(null, null);
            } else if (error.status >= 400) {
              if (!error.json().errors[0]) {
                console.log(error);
              }
              else {
                if (error.json().errors[0].description) {
                  this.genericModalService.openModal(null, error.json().errors[0].message);
                } else {
                  this.cancelSubscriptions();
                  this.startSubscriptions();
                }
              }
            }
          }
        )
      ;
    }

    copyToClipboardClicked(address: AddressLabel) {
        if (this.clipboardService.copyFromContent(address.address)) {
        }
    }

    sendClicked(address: AddressLabel) {
        console.log(address.label);
    }

    removeClicked(address: AddressLabel) {
      this.apiService.removeAddressBookAddress(address.label)
        .subscribe(
          response =>  {
            if (response.status >= 200 && response.status < 400) {
              this.cancelSubscriptions();
              this.startSubscriptions();
            }
          },
          error => {
            if (error.status === 0) {
              this.genericModalService.openModal(null, null);
            } else if (error.status >= 400) {
              if (!error.json().errors[0]) {
                console.log(error);
              }
              else {
                this.genericModalService.openModal(null, error.json().errors[0].message);
              }
            }
          }
        )
      ;
    }

    addNewAddressClicked() {
        this.modalService.open(AddNewAddressComponent);
    }
}
