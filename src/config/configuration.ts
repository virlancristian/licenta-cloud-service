export default (): {
    PORT: number | string
} => ({
    PORT: process.env.PORT || 5000
})