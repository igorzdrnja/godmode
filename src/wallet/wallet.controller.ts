import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AddressQueryDto } from './dto/address-query.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {
  }

  @Get()
  classifyWallet(
    @Query(ValidationPipe)
    address: AddressQueryDto,
  ) {
    this.walletService.readTokenRequests();
    return this.walletService.classifyWallet(address.address);
  }
}
