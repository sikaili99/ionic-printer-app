import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { commands } from './../../providers/printcommand/printcommand';

 declare var bluetoothSerial: any;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  devicelists: any;

  constructor(public navCtrl: NavController) {
   
  }

  ionViewDidLoad(){
      this.isEnabled()
      this.listDevices();
  }
listDevices() {
  bluetoothSerial.list(devices => this.devicelists = devices)
}
  isEnabled(){
    bluetoothSerial.enable(
      function() {
          alert("Bluetooth is enabled");
      },
      function() {
          alert("The user did *not* enable Bluetooth");
      }
  );
  return true;
  }

  noSpecialChars(string) {
    var translate = {
        "à": "a",
        "á": "a",
        "â": "a",
        "ã": "a",
        "ä": "a",
        "å": "a",
        "æ": "a",
        "ç": "c",
        "è": "e",
        "é": "e",
        "ê": "e",
        "ë": "e",
        "ì": "i",
        "í": "i",
        "î": "i",
        "ï": "i",
        "ð": "d",
        "ñ": "n",
        "ò": "o",
        "ó": "o",
        "ô": "o",
        "õ": "o",
        "ö": "o",
        "ø": "o",
        "ù": "u",
        "ú": "u",
        "û": "u",
        "ü": "u",
        "ý": "y",
        "þ": "b",
        "ÿ": "y",
        "ŕ": "r",
        "À": "A",
        "Á": "A",
        "Â": "A",
        "Ã": "A",
        "Ä": "A",
        "Å": "A",
        "Æ": "A",
        "Ç": "C",
        "È": "E",
        "É": "E",
        "Ê": "E",
        "Ë": "E",
        "Ì": "I",
        "Í": "I",
        "Î": "I",
        "Ï": "I",
        "Ð": "D",
        "Ñ": "N",
        "Ò": "O",
        "Ó": "O",
        "Ô": "O",
        "Õ": "O",
        "Ö": "O",
        "Ø": "O",
        "Ù": "U",
        "Ú": "U",
        "Û": "U",
        "Ü": "U",
        "Ý": "Y",
        "Þ": "B",
        "Ÿ": "Y",
        "Ŕ": "R"
      },
      translate_re = /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþßàáâãäåæçèéêëìíîïðñòóôõöøùúûýýþÿŕŕÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÝÝÞŸŔŔ]/gim;
    return (string.replace(translate_re, function (match) {
      return translate[match];
    }));
  }

  connect(data){
   // alert(data);
    bluetoothSerial.connect(data,
     function(result){
      console.log("Success");
      alert('Bluetooth printer connected')
    });
  }
  desconnect(data){
    bluetoothSerial.disconnect(function(data){
      console.log("Success");
      alert('Bluetooth printer desconnected')
    },function(err){
      console.log("Error");
      alert(err)
    })
  }
  // Call this method for printing
  print(){ 
    //Data to be printed presented in jsonData format.....
    let jsonData = [
      { id: 1, name: "Soda", price: 3.12},
      { id: 2, name: "Beer", price: 6.50},
      { id: 3, name: "Margarita", price: 12.99}
    ];
    const items = item => ({name: item.name, price: item.price});
    let product = jsonData.map(items);

    //Calculate the total price of the items in an object
    let totalPrice = jsonData.reduce((acc,next) => acc + next.price, 0);

    let fontSmall = '\x1b\x4d\x02'; //Small font size
    let fontMed = '\x1b\x4d\x01'
    let fontSBig = '\x1b\x4d\x00';
    let company = "Outsource Now";
    let cashier = "Mathews M";
    let amoutntReceived = 400;
    let change = amoutntReceived - totalPrice;
    
    let receipt = "";
      receipt += fontSBig;
      receipt += "\x1b\x45\x01 \x00 Welcome to " +company+ "\x1b\x45\x00"+ '\n';
      receipt += commands.HORIZONTAL_LINE.HR_58MM + '\n';
      receipt += '\x1b\x61\x00' + "Cashier: ";
      receipt +=  cashier +'\n';
      receipt += '\x1b\x61\x00' + "Items Bought:\n";
      receipt +fontMed;
    
      for(var pro in product) {
        if (product.hasOwnProperty(pro)) {
          var item = product[pro]
          var itemName = item.name
          var itemPrice =  item.price
          receipt += '\x1b\x61\x00'+ itemName+':'+ '\x1b\x61\x00'+itemPrice
          receipt += '\n'
        }
      }
    receipt += '\x1b\x61\x00'+"Total:";
    receipt +=  "K" + totalPrice +"\n";
    receipt += '\x1b\x61\x00' + "Amount Received:";
    receipt +=  "K" +amoutntReceived+ "\n";
    receipt += '\x1b\x61\x00' + "Change:";
    receipt +=  "K" + change + "\n";
    receipt += '\x1b\x61\x00' + "Payment Type:";
    receipt +=  "Cash"+ '\n';
    receipt += fontSBig;
    receipt += commands.HORIZONTAL_LINE.HR2_58MM+ '\n'
    receipt += fontSmall;
    receipt += '\x1b\x61\x01'+ 'Outsource Now 2018' + '\x0a\x0a\x0a\x0a'; //The unicode symbols are for centering the text
    // Write data to the printer now
    this.printText(receipt);
}

printText(receipt){  
    bluetoothSerial.write(receipt, function(data){
      console.log("Success");
      alert(`Work printed.`);
  },function(err){
      console.log("Error");
      alert(err)
  }, "String to Print")
 }
}
