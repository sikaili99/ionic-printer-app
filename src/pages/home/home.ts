import { Component } from '@angular/core'
import { NavController } from 'ionic-angular'
import { commands } from './../../providers/printcommand/printcommand'
import { vsprintf } from 'sprintf-js'

 declare var bluetoothSerial: any
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  devicelists: any

  constructor(public navCtrl: NavController) {
   
  }

  ionViewDidLoad(){
      this.isEnabled()
      this.listDevices()
  }
listDevices() {
  bluetoothSerial.list(devices => this.devicelists = devices)
}

  isEnabled(){
    bluetoothSerial.enable(
      function() {
          alert("Bluetooth is enabled")
      },
      function() {
          alert("The user did *not* enable Bluetooth")
      }
  )
  return true
  }

  connect(data){
   // alert(data)
    bluetoothSerial.connect(data,
     function(result){
      console.log("Success")
      alert('Bluetooth printer connected')
    })
  }
  desconnect(data){
    bluetoothSerial.disconnect(function(data){
      console.log("Success")
      alert('Bluetooth printer desconnected')
    },function(err){
      console.log("Error")
      alert(err)
    })
  }
  //Wrape text 

  formatTextWrap(text, maxLineLength){
    const words = text.replace(/[\r\n]+/g, ' ').split(' ');
    let lineLength = 0;
    
    // use functional reduce, instead of for loop 
    return words.reduce((result, word) => {
      if (lineLength + word.length >= maxLineLength) {
        lineLength = word.length;
        return result + `\n${word}`; // don't add spaces upfront
      } else {
        lineLength += word.length + (result ? 1 : 0);
        return result ? result + ` ${word}` : `${word}`; // add space only when needed
      }
    }, '');
  }

  // Call this method for printing
  print(){ 
//Data to be printed presented in jsonData format.....
    let jsonData = [
      { id: 1, name: "Cream soda beans and dry fish", price: 80.12},
      { id: 2, name: "Beer", price: 6.50},git 
      { id: 3, name: "Margarita Clasic", price: 12.99}
    ]
    const items = item => ({name: item.name, price: item.price})
    let product = jsonData.map(items)

    //Calculate the total price of the items in an object
    let totalPrice = jsonData.reduce((acc,next) => acc + next.price, 0)

    let company = "Beez Bee"
    let cashier = "Mathews M"
    let amoutntReceived = 400
    let change = amoutntReceived - totalPrice
    
    let receipt = ""
      receipt += commands.TEXT_FORMAT.TXT_WIDTH[1]
      receipt += "\x1b\x45\x01 \x00" +company+ "\x1b\x45\x00"
      receipt += '\n'
      receipt += commands.TEXT_FORMAT.TXT_NORMAL
      receipt += commands.HORIZONTAL_LINE.HR_58MM
      receipt += '\n'
      receipt += commands.TEXT_FORMAT.TXT_NORMAL
      receipt += '\x1B' + '\x61' + '\x30'// left align
      receipt +=  vsprintf("%-17s %3s %10s\n", ["Cashier", "" ,cashier ])    

      receipt += commands.TEXT_FORMAT.TXT_ALIGN_RT
      receipt += commands.TEXT_FORMAT.TXT_FONT_A
      receipt += commands.HORIZONTAL_LINE.HR2_58MM
      receipt += '\n'
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT
      receipt +=  vsprintf("%-17s %3s %10s \n", ["Item", "", "Price"])
      for(var pro in product) {
        if (product.hasOwnProperty(pro)) {
          var item = product[pro]
          var itemName = item.name
          var itemPrice =  item.price

          receipt +=  vsprintf("%-17s %3s %10.2f\n", [this.formatTextWrap(itemName, 16), "" , itemPrice])    
          receipt += '\n'
        }
      }
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT
    receipt += commands.TEXT_FORMAT.TXT_FONT_A
    receipt += commands.HORIZONTAL_LINE.HR2_58MM
    receipt +=  vsprintf("%-17s %3s %10.2f\n", ["Total", "" , totalPrice])    

    receipt += commands.TEXT_FORMAT.TXT_ALIGN_RT
    receipt += '\n'
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT
    receipt +=  vsprintf("%-17s %3s %10.2f\r\n", ["Amount Received", "" , amoutntReceived])    
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_RT
    receipt += '\n'
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT
    receipt +=  vsprintf("%-17s %3s %10.2f\n", ["Change", "" , change])    
    
    receipt += '\n'
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT
    receipt +=  vsprintf("%-17s %3s %10s\n\n", ["Payment type:", "" , "Cash"])    

 receipt += commands.TEXT_FORMAT.TXT_ALIGN_RT

    receipt += '\n'
    receipt += commands.TEXT_FORMAT.TXT_FONT_A
    receipt += commands.HORIZONTAL_LINE.HR2_58MM
    receipt += '\n'
    receipt += commands.TEXT_FORMAT.TXT_FONT_B
    receipt += '\x1b\x61\x01'+ 'Thank you, call again!' + '\x0a\x0a\x0a\x0a' //The unicode symbols are for centering the text
    receipt += '\n'
    this.printText(receipt)
}

printText(receipt){  
    bluetoothSerial.write(receipt, function(data){
      console.log("Success")
      alert(`Work printed.`)
  },function(err){
      console.log("Error")
      alert(err)
  }, "String to Print")
 }
}
