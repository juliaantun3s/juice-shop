/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, EventEmitter, Input, type OnInit, Output, NgZone } from '@angular/core'
import { AddressService } from '../Services/address.service'
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons/'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { Router, RouterLink } from '@angular/router'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { SelectionModel } from '@angular/cdk/collections'
import { MatIconModule } from '@angular/material/icon'
import { MatIconButton, MatButtonModule } from '@angular/material/button'
import { MatRadioButton } from '@angular/material/radio'
import { FlexModule } from '@angular/flex-layout/flex'
import { NgIf } from '@angular/common'
import { MatCardModule } from '@angular/material/card'

library.add(faEdit, faTrashAlt)

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  imports: [MatCardModule, NgIf, TranslateModule, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, FlexModule, MatCellDef, MatCell, MatRadioButton, MatIconButton, RouterLink, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatButtonModule, MatIconModule]
})
export class AddressComponent implements OnInit {
  @Output() emitSelection = new EventEmitter()
  @Input('allowEdit') public allowEdit: boolean = false
  @Input('addNewAddressDiv') public addNewAddressDiv: boolean = true
  @Input('showNextButton') public showNextButton: boolean = false
  public addressId: any = undefined
  public displayedColumns = ['Name', 'Address', 'Country']
  selection = new SelectionModel<Element>(false, [])
  public storedAddresses: any[]
  public dataSource
  public confirmation: any
  public error: any
  public addressExist: boolean = false

  constructor (private readonly addressService: AddressService, private readonly translate: TranslateService,
    private readonly router: Router, private readonly ngZone: NgZone, private readonly snackBarHelperService: SnackBarHelperService) { }

  ngOnInit (): void {
    if (this.allowEdit) {
      this.displayedColumns.push('Edit', 'Remove')
    } else {
      this.displayedColumns.unshift('Selection')
    }
    this.load()
  }

  load () {
    this.addressService.get().subscribe((addresses) => {
      this.addressExist = addresses.length
      this.storedAddresses = addresses
      this.dataSource = new MatTableDataSource<Element>(this.storedAddresses)
    }, (err) => {
      this.snackBarHelperService.open(err.error?.error, 'errorBar')
      console.log(err)
    })
  }

  emitSelectionToParent (id: number) {
    if (this.selection.hasValue()) {
      this.emitSelection.emit(id)
      this.addressId = id
    } else {
      this.emitSelection.emit(undefined)
      this.addressId = undefined
    }
  }

  chooseAddress () {
    sessionStorage.setItem('addressId', this.addressId)
    this.ngZone.run(async () => await this.router.navigate(['/delivery-method']))
  }

  deleteAddress (id: number) {
    this.addressService.del(id).subscribe(() => {
      this.error = null
      this.translate.get('ADDRESS_REMOVED').subscribe((addressRemoved) => {
        this.snackBarHelperService.open(addressRemoved, 'confirmBar')
      }, (translationId) => {
        this.snackBarHelperService.open(translationId, 'confirmBar')
      })
      this.load()
    }, (err) => {
      this.snackBarHelperService.open(err.error?.error, 'errorBar')
      console.log(err)
    })
  }
}
