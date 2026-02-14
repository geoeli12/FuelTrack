import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Plus, Users, Phone, MoreVertical, 
  Pencil, Trash2, UserPlus, Check, X, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Drivers() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "" });

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date')
  });

  const { data: readings = [] } = useQuery({
    queryKey: ['readings'],
    queryFn: () => base44.entities.FuelReading.list()
  });

  const createDriverMutation = useMutation({
    mutationFn: (data) => base44.entities.Driver.create({ ...data, status: 'active' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setDialogOpen(false);
      setFormData({ name: "", phone: "" });
    }
  });

  const updateDriverMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Driver.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setDialogOpen(false);
      setEditingDriver(null);
      setFormData({ name: "", phone: "" });
    }
  });

  const deleteDriverMutation = useMutation({
    mutationFn: (id) => base44.entities.Driver.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setDeleteConfirm(null);
    }
  });

  const getDriverStats = (driverId) => {
    const driverReadings = readings.filter(r => r.driver_id === driverId);
    const totalUsed = driverReadings.reduce((sum, r) => sum + (r.gallons_used || 0), 0);
    return { readingsCount: driverReadings.length, totalUsed };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDriver) {
      updateDriverMutation.mutate({ id: editingDriver.id, data: formData });
    } else {
      createDriverMutation.mutate(formData);
    }
  };

  const openEditDialog = (driver) => {
    setEditingDriver(driver);
    setFormData({ name: driver.name, phone: driver.phone || "" });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingDriver(null);
    setFormData({ name: "", phone: "" });
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Drivers</h1>
              <p className="text-slate-500">Manage your fleet drivers</p>
            </div>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDriver ? "Edit Driver" : "Add New Driver"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Driver name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Phone (optional)</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={!formData.name || createDriverMutation.isPending || updateDriverMutation.isPending}
                  >
                    {(createDriverMutation.isPending || updateDriverMutation.isPending) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>{editingDriver ? "Update" : "Add"} Driver</>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Drivers List */}
        <div className="space-y-3">
          <AnimatePresence>
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
              </div>
            ) : drivers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white rounded-2xl border border-slate-100"
              >
                <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 mb-4">No drivers added yet</p>
                <Button onClick={openNewDialog} variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Your First Driver
                </Button>
              </motion.div>
            ) : (
              drivers.map((driver, index) => {
                const stats = getDriverStats(driver.id);
                return (
                  <motion.div
                    key={driver.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                          {driver.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{driver.name}</span>
                            <Badge 
                              variant="secondary" 
                              className={driver.status === 'active' 
                                ? "bg-emerald-50 text-emerald-700" 
                                : "bg-slate-100 text-slate-500"
                              }
                            >
                              {driver.status}
                            </Badge>
                          </div>
                          {driver.phone && (
                            <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                              <Phone className="w-3 h-3" />
                              {driver.phone}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-semibold text-slate-800">{stats.totalUsed.toFixed(0)} gal</div>
                          <div className="text-xs text-slate-400">{stats.readingsCount} readings</div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(driver)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateDriverMutation.mutate({ 
                                id: driver.id, 
                                data: { status: driver.status === 'active' ? 'inactive' : 'active' }
                              })}
                            >
                              {driver.status === 'active' ? (
                                <><X className="w-4 h-4 mr-2" /> Deactivate</>
                              ) : (
                                <><Check className="w-4 h-4 mr-2" /> Activate</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteConfirm(driver)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Driver</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deleteConfirm?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteDriverMutation.mutate(deleteConfirm.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}