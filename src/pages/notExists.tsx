import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";

// Defina a interface para as props (recomendado para TypeScript)
interface NotExistsProps {
  title: string;
}

export function NotExists({ title }: NotExistsProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {title}
            </h3>
            <p className="text-muted-foreground">
              Esta funcionalidade será implementada em breve! Certo, Dudu !??
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}