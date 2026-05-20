import axios from 'axios';
export default class ProductClientService {
    baseURL;
    constructor(baseURL) {
        this.baseURL = baseURL;
    }
    async getProductById(productId) {
        try {
            const url = `${this.baseURL}/products/${productId}`;
            const response = await axios.get(url);
            return response.data;
        }
        catch (err) {
            throw new Error(`Product ${productId} not found`);
        }
    }
}
//# sourceMappingURL=product.client.service.js.map