import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

// Global communication
declare const window: any;

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit, OnDestroy {
  products = [
    { id: 1, name: 'Laptop Dell XPS', description: 'High performance laptop', price: 1299, category: 'Electronics', forRole: 'Admin' },
    { id: 2, name: 'iPhone 15 Pro', description: 'Latest smartphone', price: 999, category: 'Electronics', forRole: 'User' },
    { id: 3, name: 'Samsung Monitor', description: '27 inch 4K display', price: 399, category: 'Electronics', forRole: 'Manager' },
    { id: 4, name: 'Mechanical Keyboard', description: 'RGB gaming keyboard', price: 149, category: 'Accessories', forRole: 'User' },
    { id: 5, name: 'Office Chair', description: 'Ergonomic office chair', price: 299, category: 'Furniture', forRole: 'Admin' },
    { id: 6, name: 'Wireless Mouse', description: 'Bluetooth wireless mouse', price: 49, category: 'Accessories', forRole: 'Manager' }
  ];

  filteredProducts = [...this.products];
  selectedUser: any = null;
  communicationLog: string[] = [];

  ngOnInit() {
    // Lắng nghe events từ User MFE
    if (window.listenToEvents) {
      window.listenToEvents().subscribe((event: any) => {
        if (event) {
          this.handleEvent(event);
        }
      });
    }
  }

  ngOnDestroy() {
    // Cleanup nếu cần
  }

  handleEvent(event: any) {
    this.communicationLog.unshift(`📨 Received: ${event.type} from ${event.source}`);
    
    switch (event.type) {
      case 'USER_SELECTED':
        this.selectedUser = event.data;
        this.filterProductsByUserRole(event.data.role);
        this.communicationLog.unshift(`👤 User selected: ${event.data.name} (${event.data.role})`);
        break;
        
      case 'USER_ROLE_CHANGED':
        this.selectedUser = event.data;
        this.filterProductsByUserRole(event.data.role);
        this.communicationLog.unshift(`🔄 User role changed to: ${event.data.role}`);
        break;
    }
  }

  filterProductsByUserRole(role: string) {
    // Filter products based on user role
    this.filteredProducts = this.products.filter(product => 
      product.forRole === role || product.forRole === 'User' // User can see all
    );
  }

  // Send event back to User MFE
  sendProductRecommendation(product: any) {
    if (window.emitEvent && this.selectedUser) {
      const recommendation = {
        product: product,
        recommendedFor: this.selectedUser,
        reason: `Perfect for ${this.selectedUser.role} role`
      };
      
      // Send to both User MFE and Cart MFE
      window.emitEvent('PRODUCT_RECOMMENDED', recommendation, 'PRODUCT_MFE');
      this.communicationLog.unshift(`📤 Sent recommendation: ${product.name} to ${this.selectedUser.name}`);
      this.communicationLog.unshift(`🛒 Added ${product.name} to cart automatically`);
    }
  }

  // Add to cart directly
  addToCart(product: any) {
    if (window.emitEvent && this.selectedUser) {
      window.emitEvent('ADD_TO_CART', {
        product: product,
        user: this.selectedUser
      }, 'PRODUCT_MFE');
      
      this.communicationLog.unshift(`🛒 Added ${product.name} to cart`);
    } else {
      alert('Please select a user first from the Users tab!');
    }
  }

  clearCommunicationLog() {
    this.communicationLog = [];
  }
}
