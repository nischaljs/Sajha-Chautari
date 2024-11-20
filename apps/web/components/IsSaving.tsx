import { Card } from "./ui/card";

const IsSaving = () => {
    return (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-slide-up bg-green-500 text-white p-4 rounded-lg shadow-lg">
            <Card className="bg-transparent shadow-none">
                <div className="font-medium">Elements are being saved</div>
            </Card>
        </div>
    );
};

export default IsSaving;
