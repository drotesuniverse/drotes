import { gql } from "@apollo/client";

// ============ CART QUERIES ============

export const GET_CART = gql`
    query GetCart {
        cart {
            contents {
                nodes {
                    key
                    product {
                        node {
                            id
                            databaseId
                            name
                            slug
                            image {
                                sourceUrl
                            }
                        }
                    }
                    variation {
                        node {
                            id
                            databaseId
                            name
                            image {
                                sourceUrl
                            }
                        }
                    }
                    quantity
                    total
                    subtotal
                    extraData {
                        key
                        value
                    }
                }
            }
            subtotal
            total
            shippingTotal
            availableShippingMethods {
                rates {
                    id
                    label
                    cost
                }
            }
        }
    }
`;

export const GET_CART_TOTAL = gql`
    query GetCartTotal {
        cart {
            total
            contents {
                itemCount
            }
        }
    }
`;

// ============ PRODUCT QUERIES ============

export const GET_SHOP_PRODUCTS = gql`
    query GetShopProducts($first: Int = 20, $after: String) {
        products(first: $first, after: $after, where: { status: "publish" }) {
            pageInfo {
                hasNextPage
                endCursor
            }
            nodes {
                id
                databaseId
                name
                slug
                image {
                    sourceUrl
                }
                ... on SimpleProduct {
                    price
                    regularPrice
                    salePrice
                    galleryImages {
                        nodes {
                            sourceUrl
                        }
                    }
                    productCategories {
                        nodes {
                            name
                            slug
                        }
                    }
                }
                ... on VariableProduct {
                    price
                    regularPrice
                    salePrice
                    variations {
                        nodes {
                            id
                            databaseId
                            name
                            price
                            regularPrice
                            salePrice
                            image {
                                sourceUrl
                            }
                            attributes {
                                nodes {
                                    name
                                    value
                                }
                            }
                        }
                    }
                    galleryImages {
                        nodes {
                            sourceUrl
                        }
                    }
                    productCategories {
                        nodes {
                            name
                            slug
                        }
                    }
                    attributes {
                        nodes {
                            name
                            options
                        }
                    }
                }
            }
        }
    }
`;

export const GET_PRODUCT_BY_SLUG = gql`
    query GetProductBySlug($slug: ID!) {
        product(id: $slug, idType: SLUG) {
            id
            databaseId
            name
            slug
            description
            shortDescription
            image {
                sourceUrl
            }
            ... on SimpleProduct {
                price
                regularPrice
                salePrice
                stockStatus
                galleryImages {
                    nodes {
                        sourceUrl
                    }
                }
                productCategories {
                    nodes {
                        name
                        slug
                    }
                }
            }
            ... on VariableProduct {
                price
                regularPrice
                salePrice
                stockStatus
                variations {
                    nodes {
                        id
                        databaseId
                        name
                        price
                        regularPrice
                        salePrice
                        stockStatus
                        image {
                            sourceUrl
                        }
                        attributes {
                            nodes {
                                name
                                value
                            }
                        }
                    }
                }
                attributes {
                    nodes {
                        name
                        options
                        variation
                    }
                }
                galleryImages {
                    nodes {
                        sourceUrl
                    }
                }
                productCategories {
                    nodes {
                        name
                        slug
                    }
                }
            }
        }
    }
`;

export const SEARCH_PRODUCTS = gql`
    query SearchProducts($search: String!) {
        products(first: 10, where: { search: $search, status: "publish" }) {
            nodes {
                id
                databaseId
                name
                slug
                ... on SimpleProduct {
                    price
                }
                ... on VariableProduct {
                    price
                }
                image {
                    sourceUrl
                }
            }
        }
    }
`;

// ============ PAGE QUERIES ============

export const GET_PAGE_BY_SLUG = gql`
    query GetPageBySlug($slug: ID!) {
        page(id: $slug, idType: URI) {
            id
            title
            content
            slug
        }
    }
`;

// ============ CART MUTATIONS ============

export const ADD_TO_CART = gql`
    mutation AddToCart($productId: Int!, $quantity: Int = 1, $variationId: Int, $variation: [ProductAttributeInput], $extraData: String) {
        addToCart(input: { productId: $productId, quantity: $quantity, variationId: $variationId, variation: $variation, extraData: $extraData }) {
            cartItem {
                key
                product {
                    node {
                        id
                        name
                    }
                }
                quantity
            }
            cart {
                total
                contents {
                    itemCount
                }
            }
        }
    }
`;

export const REMOVE_CART_ITEM = gql`
    mutation RemoveCartItem($keys: [ID!]!) {
        removeItemsFromCart(input: { keys: $keys }) {
            cart {
                total
                contents {
                    itemCount
                    nodes {
                        key
                    }
                }
            }
        }
    }
`;

// ============ CHECKOUT MUTATIONS ============

export const UPDATE_CUSTOMER_MUTATION = gql`
    mutation UpdateCustomer($input: UpdateCustomerInput!) {
        updateCustomer(input: $input) {
            customer {
                id
            }
        }
    }
`;

export const CHECKOUT_MUTATION = gql`
    mutation Checkout($input: CheckoutInput!) {
        checkout(input: $input) {
            result
            redirect
            order {
                id
                databaseId
                orderNumber
                status
                orderKey
                total
                subtotal
                shippingTotal
                date
                paymentMethodTitle
                billing {
                    firstName
                    lastName
                    email
                    phone
                    address1
                    city
                    country
                    postcode
                }
                shipping {
                    firstName
                    lastName
                    address1
                    city
                    country
                    postcode
                }
                lineItems {
                    nodes {
                        id
                        product {
                            node {
                                id
                                name
                                image {
                                    sourceUrl
                                }
                            }
                        }
                        variation {
                            node {
                                id
                                name
                                image {
                                    sourceUrl
                                }
                            }
                        }
                        quantity
                        total
                    }
                }
            }
        }
    }
`;

// ============ ORDER QUERIES ============

export const GET_ORDER = gql`
    query GetOrder($orderId: ID!) {
        order(id: $orderId, idType: DATABASE_ID) {
            id
            databaseId
            orderNumber
            date
            status
            total
            subtotal
            shippingTotal
            currency
            paymentMethodTitle
            billing {
                firstName
                lastName
                email
                phone
                address1
                city
                country
                postcode
            }
            shipping {
                firstName
                lastName
                address1
                city
                country
                postcode
            }
            lineItems {
                nodes {
                    id
                    product {
                        node {
                            id
                            name
                            image {
                                sourceUrl
                            }
                        }
                    }
                    variation {
                        node {
                            id
                            name
                            image {
                                sourceUrl
                            }
                        }
                    }
                    quantity
                    total
                }
            }
        }
    }
`;

// ============ PAYMENT QUERIES ============

export const GET_PAYMENT_GATEWAYS = gql`
    query GetPaymentGateways {
        paymentGateways {
            nodes {
                id
                title
                description
            }
        }
    }
`;

// ============ AUTH MUTATIONS ============

export const LOGIN_MUTATION = gql`
    mutation Login($username: String!, $password: String!) {
        login(input: { username: $username, password: $password }) {
            authToken
            user {
                id
                databaseId
                name
                email
            }
        }
    }
`;

export const REGISTER_CUSTOMER_MUTATION = gql`
    mutation RegisterCustomer($email: String!, $username: String!, $password: String!) {
        registerCustomer(input: { email: $email, username: $username, password: $password }) {
            customer {
                id
                databaseId
                email
            }
        }
    }
`;
