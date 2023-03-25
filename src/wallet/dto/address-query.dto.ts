import { IsEthereumAddress } from 'class-validator';

export class AddressQueryDto {
  @IsEthereumAddress()
  address: string;
}