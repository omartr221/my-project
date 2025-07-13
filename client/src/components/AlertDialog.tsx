import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export default function AlertDialog() {
  const { isAlertActive, currentAlert, stopRepeatingAlert } = useNotifications();

  if (!isAlertActive || !currentAlert) {
    return null;
  }

  return (
    <Dialog open={isAlertActive} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-red-50 border-red-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            {currentAlert.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-red-700 whitespace-pre-line">
            {currentAlert.body}
          </p>
          <div className="mt-4 p-3 bg-red-100 rounded-lg">
            <p className="text-sm text-red-600">
              ⚠️ هذا التنبيه سيتكرر كل 30 ثانية حتى تقوم بإيقافه
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={stopRepeatingAlert}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <X className="h-4 w-4 mr-2" />
            إيقاف التنبيه
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}